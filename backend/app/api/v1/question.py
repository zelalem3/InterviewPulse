from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.models import User, Interview, Resume, Question
from app.schemas.question import QuestionResponse
from app.core.deps import get_current_user

router = APIRouter(prefix="/interviews", tags=["Questions"])

@router.post("/{interview_id}/generate-questions", response_model=List[QuestionResponse], status_code=status.HTTP_201_CREATED)
async def generate_interview_questions(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Verify the interview exists and belongs to the user
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )

    # 2. Fetch the associated resume for context
    resume = db.query(Resume).filter(Resume.id == interview.resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated resume not found"
        )

    # 3. Check if questions already exist for this interview
    existing_questions = db.query(Question).filter(Question.interview_id == interview.id).all()
    if existing_questions:
        return existing_questions  

    # 4. Generate questions (Integration point for Google Gemini API)
    # TODO: Pass resume.parsed_content and interview.job_role into your Gemini prompt generator here.
    # For now, here is a mock implementation of generated questions to wire up the database layer:
    
    mock_generated_questions = [
        {
            "question_text": f"Can you walk me through a complex project from your resume where you applied skills relevant to a {interview.job_role}?",
            "expected_topics": "Architecture, problem-solving, tech stack choices"
        },
        {
            "question_text": "How do you handle asynchronous bottlenecks and database performance tuning in high-concurrency environments?",
            "expected_topics": "Database indexing, query optimization, async workers"
        },
        {
            "question_text": "Describe a time you faced a critical production bug right before a release. How did you handle it?",
            "expected_topics": "Debugging workflow, composure, teamwork"
        }
    ]

    created_questions = []
    for q_data in mock_generated_questions:
        db_question = Question(
            interview_id=interview.id,
            question_text=q_data["question_text"],
            expected_topics=q_data["expected_topics"]
        )
        db.add(db_question)
        db.commit()
        db.refresh(db_question)
        created_questions.append(db_question)

    # Update interview status to in_progress
    interview.status = "in_progress"
    db.commit()

    return created_questions


@router.get("/{interview_id}/questions", response_model=List[QuestionResponse])
async def get_interview_questions(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify interview ownership
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()

    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found")

    questions = db.query(Question).filter(Question.interview_id == interview.id).all()
    return questions