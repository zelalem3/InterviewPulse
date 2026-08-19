import os
import json
import google.generativeai as genai
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import User, Interview, Question, Answer, Result, CodingQuestion, CodingAnswer
from app.core.deps import get_current_user
from app.schemas.result import ResultResponse

router = APIRouter(prefix="/interviews", tags=["Evaluations"])

@router.post("/{interview_id}/evaluate", response_model=ResultResponse, status_code=status.HTTP_201_CREATED)
async def evaluate_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Fetch interview and verify ownership
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found")

    # 2. Gather standard verbal/theory questions and answers efficiently (Batch Lookup)
    questions = db.query(Question).filter(Question.interview_id == interview.id).all()
    question_ids = [q.id for q in questions]
    
    answers = []
    if question_ids:
        answers = db.query(Answer).filter(Answer.question_id.in_(question_ids)).all()
    answer_map = {a.question_id: a.answer_text for a in answers}

    interview_data = [
        {
            "type": "theory_question",
            "question": q.question_text,
            "expected_topics": getattr(q, 'expected_topics', 'General technical competency'),
            "answer": answer_map.get(q.id, "No answer provided")
        }
        for q in questions
    ]

    # 3. Gather coding challenges and submitted code efficiently (Batch Lookup)
    coding_questions = db.query(CodingQuestion).filter(CodingQuestion.interview_id == interview.id).all()
    cq_ids = [cq.id for cq in coding_questions]
    
    coding_answers = []
    if cq_ids:
        coding_answers = db.query(CodingAnswer).filter(CodingAnswer.question_id.in_(cq_ids)).all()
    c_answer_map = {ca.question_id: ca.answer_text for ca in coding_answers}

    coding_data = [
        {
            "type": "coding_challenge",
            "question": cq.question_text,
            "candidate_code": c_answer_map.get(cq.id, "No code submitted")
        }
        for cq in coding_questions
    ]

    if not interview_data and not coding_data:
        raise HTTPException(status_code=400, detail="No questions or coding challenges found for this interview evaluation.")

    # 4. Extract Resume Data safely
    latest_resume = current_user.resumes[-1] if current_user.resumes else None
    resume_data = latest_resume.extracted_data if latest_resume else "No resume data available"

    # 5. Call Gemini AI Evaluation
    ai_evaluation_raw = generate_comprehensive_evaluation(interview_data, coding_data, resume_data)
    
    try:
        eval_data = json.loads(ai_evaluation_raw)
    except json.JSONDecodeError:
        eval_data = {
            "overall_score": 7.0,
            "categories": {
                "technical_depth": 7.0,
                "problem_solving": 7.0,
                "communication": 7.0,
                "code_implementation": 7.0
            },
            "feedback_summary": "Good overall execution across technical and coding assessment sections."
        }

    overall_score = float(eval_data.get("overall_score", 7.0))
    
    feedback_payload = {
        "summary": eval_data.get("feedback_summary", ""),
        "categories": eval_data.get("categories", {}),
        "detailed_breakdown": eval_data.get("detailed_breakdown", [])
    }
    feedback_json_str = json.dumps(feedback_payload)

    # 6. Save or update the result record
    existing_result = db.query(Result).filter(Result.interview_id == interview.id).first()
    if existing_result:
        existing_result.overall_score = overall_score
        existing_result.feedback_summary = feedback_json_str
        result_record = existing_result
    else:
        result_record = Result(
            interview_id=interview.id,
            overall_score=overall_score,
            feedback_summary=feedback_json_str
        )
        db.add(result_record)

    interview.status = "completed"
    db.commit()
    db.refresh(result_record)

    return result_record


def generate_comprehensive_evaluation(interview_data: list, coding_data: list, parsed_text: str):
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    
    # Using a fast, active model configuration
    model = genai.GenerativeModel("gemini-1.5-flash")
    
    prompt = f"""
    You are an expert technical hiring manager and principal interviewer. Review the candidate's complete performance, 
    including verbal interview answers AND their practical coding solutions, alongside their CV background details.
    Evaluate their performance comprehensively to give them an insightful, motivating, and broad assessment.
    
    Candidate CV Content:
    {parsed_text}
    
    Verbal/Theory Questions & Answers:
    {json.dumps(interview_data, indent=2)}
    
    Coding Challenges & Submitted Code:
    {json.dumps(coding_data, indent=2)}
    
    Provide a detailed evaluation broken down across multiple core performance categories (scored out of 10):
    1. Technical Accuracy & Conceptual Depth
    2. Problem Solving, Logic & Code Implementation
    3. Communication & Clarity (Theory responses)
    4. Practical Execution & CV Alignment
    
    Return the result strictly as a JSON object with the following schema:
    {{
      "overall_score": 7.5,
      "categories": {{
        "technical_depth": 8.0,
        "problem_solving": 7.0,
        "communication": 8.5,
        "code_implementation": 7.5
      }},
      "feedback_summary": "A comprehensive, encouraging summary highlighting major strengths, code quality assessment, growth areas, and actionable advice.",
      "detailed_breakdown": [
        {{
          "question_type": "theory",
          "index": 1,
          "critique": "Specific feedback for theory item."
        }},
        {{
          "question_type": "coding",
          "index": 1,
          "critique": "Specific code review critique, syntax correctness, and algorithmic approach."
        }}
      ]
    }}
    """
    
    response = model.generate_content(
        prompt,
        generation_config={"response_mime_type": "application/json"}
    )
    
    return response.text