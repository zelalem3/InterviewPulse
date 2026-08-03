from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime


from app.database.session import get_db
from app.models.models import User, Interview, Question, Answer, Resume
from app.core.deps import get_current_user

router = APIRouter(prefix="/questions", tags=["Answers"])

class AnswerCreate(BaseModel):
    answer_text: str

class AnswerResponse(BaseModel):
    id: int
    question_id: int
    answer_text: str
    submitted_at: datetime

    class Config:
        from_attributes = True

@router.post("/{question_id}/answer", response_model=AnswerResponse, status_code=status.HTTP_201_CREATED)
async def submit_answer(
    question_id: int,
    payload: AnswerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Verify the question exists
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    # 2. Verify that the parent interview belongs to the current user
    interview = db.query(Interview).filter(
        Interview.id == question.interview_id,
        Interview.user_id == current_user.id
    ).first()
    if not interview:
        raise HTTPException(status_code=403, detail="Not authorized to answer this question")

    # 3. Check if an answer already exists, update or create
    existing_answer = db.query(Answer).filter(Answer.question_id == question_id).first()
    if existing_answer:
        existing_answer.answer_text = payload.answer_text
        db.commit()
        db.refresh(existing_answer)
        return existing_answer
    
    resume_record = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.id.desc()).first()
    resume_data = resume_record.extracted_data if resume_record else None
    
    

    new_answer = Answer(
        question_id=question_id,
        answer_text=payload.answer_text
    )
    db.add(new_answer)
    db.commit()
    db.refresh(new_answer)

    return new_answer

