from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import func

from app.database.session import get_db
from app.models.models import User, Interview, Resume
from app.schemas.interview import InterviewCreate, InterviewResponse
from app.core.deps import get_current_user

router = APIRouter(prefix="/interviews", tags=["Interviews"])

@router.get("/stats/summary")
async def get_user_interview_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_sessions = db.query(func.count(Interview.id)).filter(Interview.user_id == current_user.id).scalar() or 0

    completed_query = db.query(Interview).filter(
        Interview.user_id == current_user.id,
        func.lower(Interview.status) == "completed"
    )
    completed_sessions_list = completed_query.all()
    completed_count = len(completed_sessions_list)

    # Safely extract score using getattr with a fallback of 50 if the column/attribute doesn't exist
    processed_scores = [
        getattr(i, 'score', 50) if getattr(i, 'score', 50) is not None else 50
        for i in completed_sessions_list
    ]

    avg_score = (
        sum(processed_scores) / len(processed_scores) 
        if processed_scores 
        else 0.0
    )

    score_trends = [
        {
            "id": i.id,
            "job_role": i.job_role,
            "score": getattr(i, 'score', 50) if getattr(i, 'score', 50) is not None else 50,
            "date": i.created_at.strftime("%Y-%m-%d") if i.created_at else "2026-08-18"
        }
        for i in completed_sessions_list
    ]

    return {
        "total_sessions": total_sessions,
        "completed_sessions": completed_count,
        "average_score": round(avg_score, 1),
        "score_trends": score_trends
    }


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
    # Fetch only necessary fields or lightweight records for listing
    interviews = db.query(Interview).filter(Interview.user_id == current_user.id).all()
    return interviews

@router.get("/result/{id}")
async def get_result(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    interview = db.query(Interview).filter(Interview.id == id, Interview.user_id == current_user.id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return interview.result