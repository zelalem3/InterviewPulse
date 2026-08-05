from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models.models import User, Interview, Resume
from app.schemas.interview import InterviewCreate, InterviewResponse
from app.core.deps import get_current_user

router = APIRouter(prefix="/interviews", tags=["Interviews"])

@router.post("/", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
async def create_interview(
    payload: InterviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    resume = db.query(Resume).filter(
        Resume.id == payload.resume_id, 
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or does not belong to user"
        )

    # Create the interview session
    new_interview = Interview(
        user_id=current_user.id,
        resume_id=payload.resume_id,
        job_role=payload.job_role,
        status="pending"
    )
    
    db.add(new_interview)
    db.commit()
    db.refresh(new_interview)
    
    return new_interview


@router.get("/", response_model=List[InterviewResponse])
async def list_user_interviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch all interviews belonging to the logged-in user
    interviews = db.query(Interview).filter(Interview.user_id == current_user.id).all()
    return interviews

@router.get("/result/:id")
async def get_result(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    interview = db.query(Interview).filter(Interview.id == id).first()
    result = interview.result
    return result


