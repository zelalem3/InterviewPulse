from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import func

from app.database.session import get_db
from app.models.models import User, Interview, Resume, Result, Question, Answer
from app.schemas.interview import InterviewCreate, InterviewResponse
from app.core.deps import get_current_user

router = APIRouter(prefix="/interviews", tags=["Interviews"])

@router.get("/stats/summary")
def get_user_interview_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_sessions = (
        db.query(func.count(Interview.id))
        .filter(Interview.user_id == current_user.id)
        .scalar()
        or 0
    )
    completed_filter = (
        Interview.user_id == current_user.id,
        func.lower(Interview.status) == "completed",
    )
    completed_count = (
        db.query(func.count(Interview.id))
        .filter(*completed_filter)
        .scalar()
        or 0
    )
    answer_scores = (
        db.query(
            Question.interview_id.label("interview_id"),
            func.avg(Answer.score).label("score"),
        )
        .join(Answer, Answer.question_id == Question.id)
        .group_by(Question.interview_id)
        .subquery()
    )
    score_value = func.coalesce(Result.overall_score, answer_scores.c.score)
    avg_score = (
        db.query(func.avg(score_value))
        .select_from(Interview)
        .outerjoin(Result, Result.interview_id == Interview.id)
        .outerjoin(answer_scores, answer_scores.c.interview_id == Interview.id)
        .filter(*completed_filter)
        .scalar()
        or 0.0
    )
    trend_rows = (
        db.query(
            Interview.id,
            Interview.job_role,
            Interview.created_at,
            score_value.label("score"),
        )
        .outerjoin(Result, Result.interview_id == Interview.id)
        .outerjoin(answer_scores, answer_scores.c.interview_id == Interview.id)
        .filter(*completed_filter, score_value.isnot(None))
        .order_by(Interview.created_at.desc(), Interview.id.desc())
        .limit(30)
        .all()
    )
    score_trends = [
        {
            "id": row.id,
            "job_role": row.job_role,
            "score": row.score,
            "date": row.created_at.strftime("%Y-%m-%d") if row.created_at else "",
        }
        for row in reversed(trend_rows)
    ]

    return {
        "total_sessions": total_sessions,
        "completed_sessions": completed_count,
        "average_score": round(float(avg_score), 1),
        "score_trends": score_trends
    }


@router.post("/", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
def create_interview(
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
def list_user_interviews(
    response: Response,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    base_query = db.query(Interview).filter(Interview.user_id == current_user.id)
    total_count = base_query.with_entities(func.count(Interview.id)).scalar() or 0
    response.headers["X-Total-Count"] = str(total_count)
    interviews = (
        base_query
        .order_by(Interview.created_at.desc(), Interview.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return interviews

@router.get("/result/{id}")
def get_result(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    interview = db.query(Interview).filter(Interview.id == id, Interview.user_id == current_user.id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return interview.result