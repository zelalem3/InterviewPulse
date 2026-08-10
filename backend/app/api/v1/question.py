import os
import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models.models import User, Interview, Resume, Question, Answer
from app.core.deps import get_current_user
import google.generativeai as genai

router = APIRouter(prefix="/interviews", tags=["Conversational Interview"])

def get_interview_history(interview_id: int, db: Session):
    questions = (
        db.query(Question)
        .filter(Question.interview_id == interview_id)
        .order_by(Question.sequence_number.asc())
        .all()
    )
    history = []
    for q in questions:
        ans = db.query(Answer).filter(Answer.question_id == q.id).first()
        history.append({
            "question": q.question_text,
            "answer": ans.answer_text if ans else None,
            "score": ans.score if ans else None,
            "feedback": ans.feedback if ans else None,
            "topic": q.topic,
            "question_type": q.question_type
        })
    return history

def generate_next_question_ai(resume_text, job_role, history):
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel("models/gemini-3.5-flash")

    prompt = f"""
You are conducting a realistic, adaptive technical interview.
Job role: {job_role}
Candidate resume: {resume_text}

Previous conversation:
{json.dumps(history, indent=2)}

Decide the next step:
1. Ask exactly ONE question.
2. If the previous answer was vague, incomplete, or technically interesting, probe deeper with a follow-up.
3. If the topic is exhausted, transition to a new relevant technical area from the resume or job profile.
4. Keep total questions to around 5-8 unless deep probing requires more. If you believe the interview has covered enough ground to conclude, set "interview_finished": true.

Return ONLY JSON:
{{
    "interview_finished": false,
    "question_text": "",
    "expected_topics": "",
    "topic": "",
    "question_type": "initial",
    "is_follow_up": false
}}
"""
    response = model.generate_content(prompt)
    return json.loads(response.text.strip().replace("```json", "").replace("```", ""))


@router.post("/{interview_id}/start")
async def start_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    interview = db.query(Interview).filter(Interview.id == interview_id, Interview.user_id == current_user.id).first()
    if not interview:
        raise HTTPException(404, "Interview not found")

    resume = db.query(Resume).filter(Resume.id == interview.resume_id).first()
    resume_text = resume.extracted_data if resume else "No resume provided"

    # Check if a starting question already exists
    existing_q = db.query(Question).filter(Question.interview_id == interview.id).first()
    if existing_q:
        return {"question": {"id": existing_q.id, "question_text": existing_q.question_text}}

    q_data = generate_next_question_ai(resume_text, interview.job_role, [])
    
    question = Question(
        interview_id=interview.id,
        question_text=q_data["question_text"],
        expected_topics=q_data.get("expected_topics"),
        topic=q_data.get("topic"),
        question_type=q_data.get("question_type", "initial"),
        sequence_number=1,
        is_follow_up=False
    )
    db.add(question)
    interview.status = "in_progress"
    db.commit()
    db.refresh(question)

    return {"question": {"id": question.id, "question_text": question.question_text}}


@router.post("/questions/{question_id}/answer")
async def submit_answer_and_proceed(
    question_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    answer_text = payload.get("answer_text")
    if not answer_text:
        raise HTTPException(400, "Answer text is required")

    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(404, "Question not found")

    interview = db.query(Interview).filter(Interview.id == question.interview_id, Interview.user_id == current_user.id).first()
    if not interview:
        raise HTTPException(403, "Unauthorized")

    resume = db.query(Resume).filter(Resume.id == interview.resume_id).first()
    resume_text = resume.extracted_data if resume else "No resume"

    # 1. Evaluate Current Answer via Gemini
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    eval_model = genai.GenerativeModel("models/gemini-3.5-flash")
    eval_prompt = f"""
Evaluate this technical interview answer.
Question: {question.question_text}
Candidate Answer: {answer_text}
Resume: {resume_text}
Expected Topics: {question.expected_topics}

Return ONLY JSON:
{{
    "model_answer": "",
    "score": 0,
    "feedback": ""
}}
"""
    eval_res = eval_model.generate_content(eval_prompt)
    eval_data = json.loads(eval_res.text.strip().replace("```json", "").replace("```", ""))

    # Save or Update Answer & Evaluation to prevent UniqueViolation duplicates
    db_answer = db.query(Answer).filter(Answer.question_id == question.id).first()

    if db_answer:
        db_answer.answer_text = answer_text
        db_answer.score = eval_data.get("score")
        db_answer.feedback = eval_data.get("feedback")
        db_answer.model_answer = eval_data.get("model_answer")
    else:
        db_answer = Answer(
            question_id=question.id,
            answer_text=answer_text,
            score=eval_data.get("score"),
            feedback=eval_data.get("feedback"),
            model_answer=eval_data.get("model_answer")
        )
        db.add(db_answer)

    db.commit()

    # 2. Build History & Determine Next Step
    history = get_interview_history(interview.id, db)
    
    # Force finish if we've reached a cap (e.g., 6 questions)
    if len(history) >= 6:
        interview.status = "completed"
        db.commit()
        return {
            "evaluation": eval_data,
            "interview_finished": True,
            "final_result": {
                "overall_score": sum([h["score"] or 0 for h in history]) / len(history),
                "feedback_summary": "Interview completed successfully across multiple technical domains."
            }
        }

    next_q_data = generate_next_question_ai(resume_text, interview.job_role, history)

    if next_q_data.get("interview_finished", False):
        interview.status = "completed"
        db.commit()
        return {
            "evaluation": eval_data,
            "interview_finished": True,
            "final_result": {
                "overall_score": sum([h["score"] or 0 for h in history]) / len(history),
                "feedback_summary": "The AI concluded the session based on comprehensive topic coverage."
            }
        }

    sequence = db.query(Question).filter(Question.interview_id == interview.id).count() + 1
    next_question = Question(
        interview_id=interview.id,
        question_text=next_q_data["question_text"],
        expected_topics=next_q_data.get("expected_topics"),
        topic=next_q_data.get("topic"),
        question_type=next_q_data.get("question_type"),
        sequence_number=sequence,
        is_follow_up=next_q_data.get("is_follow_up", False)
    )
    db.add(next_question)
    db.commit()
    db.refresh(next_question)

    return {
        "evaluation": eval_data,
        "interview_finished": False,
        "next_question": {
            "id": next_question.id,
            "question_text": next_question.question_text
        }
    }