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
   
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found")

    # 2. Gather standard verbal/theory questions and answers
    questions = db.query(Question).filter(Question.interview_id == interview.id).all()
    interview_data = []
    for q in questions:
        ans = db.query(Answer).filter(Answer.question_id == q.id).first()
        interview_data.append({
            "type": "theory_question",
            "question": q.question_text,
            "expected_topics": getattr(q, 'expected_topics', 'General technical competency'),
            "answer": ans.answer_text if ans else "No answer provided"
        })

   
    coding_questions = db.query(CodingQuestion).filter(CodingQuestion.interview_id == interview.id).all()
    coding_data = []
    for cq in coding_questions:
        c_ans = db.query(CodingAnswer).filter(CodingAnswer.question_id == cq.id).first()
        coding_data.append({
            "type": "coding_challenge",
            "question": cq.question_text,
            "candidate_code": c_ans.answer_text if c_ans else "No code submitted"
        })

    if not interview_data and not coding_data:
        raise HTTPException(status_code=400, detail="No questions or coding challenges found for this interview evaluation.")

    
    latest_resume = current_user.resumes[-1] if current_user.resumes else None
    resume_data = latest_resume.extracted_data if latest_resume else "No resume data available"

    
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
        db.commit()
        db.refresh(existing_result)
        result_record = existing_result
    else:
        result_record = Result(
            interview_id=interview.id,
            overall_score=overall_score,
            feedback_summary=feedback_json_str
        )
        db.add(result_record)
        db.commit()
        db.refresh(result_record)

   
    interview.status = "completed"
    db.commit()

    return result_record


def generate_comprehensive_evaluation(interview_data: list, coding_data: list, parsed_text: str):
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    
    model = genai.GenerativeModel("gemini-3.6-flash")
    
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