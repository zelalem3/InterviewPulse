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

    # 3. Call AI Evaluation (Gemini API Integration)
    # TODO: Send interview_data and interview.job_role to Gemini to compute a score and constructive feedback.
    # For now, mock the result generation:
    mock_score = 8.5
    mock_feedback = "Strong technical depth and clear architecture breakdown. Could improve on edge-case scaling considerations."

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