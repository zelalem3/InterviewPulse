import os
import json
import google.generativeai as genai
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import User, Interview, Question, Answer, Result
from app.core.deps import get_current_user
from app.schemas.result import ResultResponse

router = APIRouter(prefix="/interviews", tags=["Evaluations"])




@router.post("/{interview_id}/evaluate", response_model=ResultResponse, status_code=status.HTTP_201_CREATED)
async def evaluate_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Verify interview ownership
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found")

    # 2. Gather all questions and corresponding answers
    questions = db.query(Question).filter(Question.interview_id == interview.id).all()
    
    interview_data = []
    for q in questions:
        ans = db.query(Answer).filter(Answer.question_id == q.id).first()
        interview_data.append({
            "question": q.question_text,
            "expected_topics": q.expected_topics,
            "answer": ans.answer_text if ans else "No answer provided"
        })

    # 3. Fetch candidate's resume data using proper relationship query
    resume_record = db.query(User).filter(User.id == current_user.id).first()
    # Assuming user's latest resume or parsed data can be accessed safely:
    latest_resume = current_user.resumes[-1] if current_user.resumes else None
    resume_data = latest_resume.extracted_data if latest_resume else "No resume data available"

    # Example integration call using the first question or looping through them
    # (Assuming you want to generate/evaluate based on the first question ID for demonstration)
    if questions:
        ai_evaluation_raw = generate_answer(questions[0].id, resume_data, db, current_user)
        # Parse the JSON response received from Gemini
        ai_evaluation_data = json.loads(ai_evaluation_raw)
        
        mock_score = ai_evaluation_data.get("score", 8.5)
        mock_feedback = ai_evaluation_data.get("feedback", "Strong technical execution.")
    else:
        mock_score = 0.0
        mock_feedback = "No questions found for evaluation."

    # 4. Save or update the result
    existing_result = db.query(Result).filter(Result.interview_id == interview.id).first()
    if existing_result:
        existing_result.overall_score = mock_score
        existing_result.feedback_summary = mock_feedback
        db.commit()
        db.refresh(existing_result)
        result_record = existing_result
    else:
        result_record = Result(
            interview_id=interview.id,
            overall_score=mock_score,
            feedback_summary=mock_feedback
        )
        db.add(result_record)
        db.commit()
        db.refresh(result_record)

    # Update interview status to completed
    interview.status = "completed"
    db.commit()

    return result_record






def generate_answer(question_id: int, parsed_text: str, db, current_user):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    interview = db.query(Interview).filter(
        Interview.id == question.interview_id,
        Interview.user_id == current_user.id
    ).first()
    
    if not interview:
        raise HTTPException(status_code=403, detail="Unauthorized access to interview")

    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    
    # Use active model string
    model = genai.GenerativeModel("gemini-3.6-flash")
    
    prompt = f"""
    You are an expert technical interviewer. Review the candidate's CV details and the specific interview question below.
    Provide a comprehensive model answer, an evaluation score (out of 10), and constructive feedback summary.
    
    Target Question: {question.question_text}
    Expected Topics: {question.expected_topics}
    
    Candidate CV Content:
    {parsed_text}
    
    Return the result strictly as a JSON object with the following keys:
    - "model_answer": "Detailed breakdown of how a top candidate should answer this."
    - "score": 7 (a float value out of 10)
    - "feedback": "Constructive summary of strengths and areas for improvement."
    """
    
    response = model.generate_content(
        prompt,
        generation_config={"response_mime_type": "application/json"}
    )
    
    return response.text