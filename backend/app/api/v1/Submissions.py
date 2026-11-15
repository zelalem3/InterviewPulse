import json
import os

from google import genai
from google.genai import types
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database.session import get_db
from app.models.models import (
    CodingAnswer,
    CodingQuestion,
    Interview,
    Resume,
    User,
)

router = APIRouter(prefix="/code", tags=["codesubmit"])


class CodeAnswerCreate(BaseModel):
    answer_text: str


@router.get("/{interview_id}")
def coding_question(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    interview = (
        db.query(Interview)
        .filter(
            Interview.id == interview_id,
            Interview.user_id == current_user.id,
        )
        .with_for_update()
        .first()
    )
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    questions = (
        db.query(CodingQuestion)
        .filter(CodingQuestion.interview_id == interview.id)
        .order_by(CodingQuestion.id.asc())
        .all()
    )
    if interview.status.lower() not in {"coding", "completed"} and not questions:
        raise HTTPException(
            status_code=409,
            detail="Complete the verbal interview before starting the coding section.",
        )
    if not questions:
        resume = (
            db.query(Resume)
            .filter(
                Resume.id == interview.resume_id,
                Resume.user_id == current_user.id,
            )
            .first()
        )
        question = generate_coding_question(interview, resume, db)
        questions = [question]
        interview.status = "coding"
        db.commit()

    answers = (
        db.query(CodingAnswer)
        .filter(CodingAnswer.question_id.in_([question.id for question in questions]))
        .all()
    )
    answers_by_question = {answer.question_id: answer for answer in answers}

    return [
        {
            "id": question.id,
            "question_text": question.question_text,
            "answer_text": (
                answers_by_question[question.id].answer_text
                if question.id in answers_by_question
                else None
            ),
        }
        for question in questions
    ]


@router.post("/{question_id}/submit")
def submit_code(
    question_id: int,
    answer_data: CodeAnswerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    answer_text = answer_data.answer_text.strip()
    if not answer_text:
        raise HTTPException(status_code=400, detail="Code answer is required")

    question = (
        db.query(CodingQuestion)
        .join(Interview, Interview.id == CodingQuestion.interview_id)
        .filter(
            CodingQuestion.id == question_id,
            Interview.user_id == current_user.id,
        )
        .first()
    )
    if not question:
        raise HTTPException(status_code=404, detail="Coding question not found")

    answer = (
        db.query(CodingAnswer)
        .filter(CodingAnswer.question_id == question.id)
        .first()
    )
    if answer:
        answer.answer_text = answer_text
    else:
        answer = CodingAnswer(question_id=question.id, answer_text=answer_text)
        db.add(answer)

    db.commit()
    db.refresh(answer)
    return {"message": "Code submitted successfully", "answer_id": answer.id}


def generate_coding_question(
    interview: Interview,
    resume: Resume | None,
    db: Session,
) -> CodingQuestion:
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="Coding question generation is unavailable because no Gemini API key is configured.",
        )
    client = genai.Client(api_key=api_key)
    resume_content = (
        resume.extracted_data
        if resume and resume.extracted_data
        else "No resume details provided."
    )

    prompt = f"""
Create exactly one practical coding interview challenge for this job role:
{interview.job_role}

Use the candidate's resume for context when relevant:
{resume_content}

The challenge must be appropriate for a junior candidate, self-contained, and
solvable in one sitting. Return only a JSON object with a "question_text" field.
"""
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    )
    try:
        question_data = json.loads(response.text or "")
    except json.JSONDecodeError as error:
        raise HTTPException(
            status_code=502,
            detail="The coding question service returned an invalid response. Please retry.",
        ) from error

    question_text = (
        question_data.get("question_text")
        if isinstance(question_data, dict)
        else None
    )
    if not isinstance(question_text, str) or not question_text.strip():
        raise HTTPException(
            status_code=502,
            detail="The coding question service did not return a question. Please retry.",
        )

    question = CodingQuestion(
        interview_id=interview.id,
        question_text=question_text.strip(),
    )
    db.add(question)
    db.commit()
    db.refresh(question)
    return question
