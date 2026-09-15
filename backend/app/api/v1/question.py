# backend/app/api/v1/question.py
import os
import json
import time
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import User, Interview, Resume, Question, Answer
from app.core.deps import get_current_user
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted

router = APIRouter(prefix="/interviews", tags=["Conversational Interview"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

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
            "question_type": q.question_type,
        })
    return history


def _configure_gemini():
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(500, "GEMINI_API_KEY is not configured")
    genai.configure(api_key=api_key)
    # Use a model that usually has higher free-tier limits
    return genai.GenerativeModel("models/gemini-2.0-flash")


def _call_gemini_with_retry(model, prompt: str, max_retries: int = 3) -> dict:
    """Call Gemini and parse JSON, with simple retry on 429 quota errors."""
    last_error = None

    for attempt in range(max_retries):
        try:
            response = model.generate_content(prompt)
            text = (response.text or "").strip()
            text = text.replace("```json", "").replace("```", "").strip()
            return json.loads(text)
        except ResourceExhausted as e:
            last_error = e
            wait = 25 * (attempt + 1)
            print(f"[Gemini] Quota exceeded. Retrying in {wait}s... (attempt {attempt + 1})")
            time.sleep(wait)
        except json.JSONDecodeError as e:
            last_error = e
            print(f"[Gemini] Invalid JSON, attempt {attempt + 1}: {e}")
            time.sleep(2)
        except Exception as e:
            last_error = e
            print(f"[Gemini] Error, attempt {attempt + 1}: {e}")
            time.sleep(2)

    raise HTTPException(
        status_code=429,
        detail=f"Gemini API quota exceeded or failed after retries: {last_error}",
    )


def generate_first_question(resume_text, job_role) -> dict:
    model = _configure_gemini()

    prompt = f"""
You are starting a realistic technical interview.

Job role: {job_role}
Candidate resume: {resume_text}

Ask exactly ONE strong opening technical question relevant to the role and resume.

Return ONLY valid JSON:
{{
    "question_text": "",
    "expected_topics": "",
    "topic": "",
    "question_type": "initial",
    "is_follow_up": false
}}
"""
    return _call_gemini_with_retry(model, prompt)


def evaluate_and_next(
    resume_text: str,
    job_role: str,
    question_text: str,
    answer_text: str,
    expected_topics: str | None,
    history: list,
) -> dict:
    """
    Single Gemini call that:
    1) evaluates the current answer
    2) decides next question OR finishes the interview
    """
    model = _configure_gemini()

    prompt = f"""
You are an expert technical interviewer conducting an adaptive interview.

Job role: {job_role}
Candidate resume: {resume_text}

Current question: {question_text}
Expected topics: {expected_topics or "General technical competency"}
Candidate answer: {answer_text}

Previous conversation history:
{json.dumps(history, indent=2)}

Tasks:
1. Evaluate the candidate's answer (score 0-10).
2. Decide whether to continue or finish the interview.
3. If continuing, produce exactly ONE next question (follow-up or new topic).

Rules:
- Aim for about 5-6 total questions. If enough ground has been covered, set interview_finished=true.
- Prefer follow-ups when the answer is vague, shallow, or interesting.
- Move to a new relevant topic when the current one is exhausted.
- Keep questions realistic and technical.

Return ONLY valid JSON with this exact structure:
{{
  "evaluation": {{
    "score": 7.5,
    "feedback": "Clear, constructive feedback for the candidate.",
    "model_answer": "A strong example answer."
  }},
  "interview_finished": false,
  "next_question": {{
    "question_text": "The next question text",
    "expected_topics": "Topics this question should cover",
    "topic": "Short topic label",
    "question_type": "follow_up",
    "is_follow_up": true
  }}
}}

If interview_finished is true, still include evaluation, and set next_question to null.
"""
    return _call_gemini_with_retry(model, prompt)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post("/{interview_id}/start")
async def start_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    interview = (
        db.query(Interview)
        .filter(Interview.id == interview_id, Interview.user_id == current_user.id)
        .first()
    )
    if not interview:
        raise HTTPException(404, "Interview not found")

    resume = db.query(Resume).filter(Resume.id == interview.resume_id).first()
    resume_text = resume.extracted_data if resume else "No resume provided"

    # If a question already exists, return it (idempotent start)
    existing_q = (
        db.query(Question)
        .filter(Question.interview_id == interview.id)
        .order_by(Question.sequence_number.asc())
        .first()
    )
    if existing_q:
        return {
            "question": {
                "id": existing_q.id,
                "question_text": existing_q.question_text,
            }
        }

    q_data = generate_first_question(resume_text, interview.job_role)

    question = Question(
        interview_id=interview.id,
        question_text=q_data.get("question_text") or "Tell me about yourself and your relevant experience.",
        expected_topics=q_data.get("expected_topics"),
        topic=q_data.get("topic"),
        question_type=q_data.get("question_type", "initial"),
        sequence_number=1,
        is_follow_up=bool(q_data.get("is_follow_up", False)),
    )
    db.add(question)
    interview.status = "in_progress"
    db.commit()
    db.refresh(question)

    return {
        "question": {
            "id": question.id,
            "question_text": question.question_text,
        }
    }


@router.post("/questions/{question_id}/answer")
async def submit_answer_and_proceed(
    question_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    answer_text = (payload.get("answer_text") or "").strip()
    if not answer_text:
        raise HTTPException(400, "Answer text is required")

    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(404, "Question not found")

    interview = (
        db.query(Interview)
        .filter(
            Interview.id == question.interview_id,
            Interview.user_id == current_user.id,
        )
        .first()
    )
    if not interview:
        raise HTTPException(403, "Unauthorized")

    resume = db.query(Resume).filter(Resume.id == interview.resume_id).first()
    resume_text = resume.extracted_data if resume else "No resume"

    # History BEFORE saving current answer (for the prompt)
    history = get_interview_history(interview.id, db)

    # Single Gemini call: evaluate + next step
    result = evaluate_and_next(
        resume_text=str(resume_text),
        job_role=interview.job_role,
        question_text=question.question_text,
        answer_text=answer_text,
        expected_topics=question.expected_topics,
        history=history,
    )

    eval_data = result.get("evaluation") or {}
    score = eval_data.get("score")
    feedback = eval_data.get("feedback")
    model_answer = eval_data.get("model_answer")

    # Save / update answer
    db_answer = db.query(Answer).filter(Answer.question_id == question.id).first()
    if db_answer:
        db_answer.answer_text = answer_text
        db_answer.score = score
        db_answer.feedback = feedback
        db_answer.model_answer = model_answer
    else:
        db_answer = Answer(
            question_id=question.id,
            answer_text=answer_text,
            score=score,
            feedback=feedback,
            model_answer=model_answer,
        )
        db.add(db_answer)

    db.commit()

    # Refresh history including current answer for scoring
    history = get_interview_history(interview.id, db)
    answered = [h for h in history if h.get("answer")]
    avg_score = (
        sum((h.get("score") or 0) for h in answered) / len(answered)
        if answered
        else 0
    )

    # Hard cap + AI decision
    force_finish = len(answered) >= 6
    ai_finished = bool(result.get("interview_finished"))

    if force_finish or ai_finished:
        interview.status = "completed"
        db.commit()
        return {
            "evaluation": {
                "score": score,
                "feedback": feedback,
                "model_answer": model_answer,
            },
            "interview_finished": True,
            "final_result": {
                "overall_score": round(avg_score, 1),
                "feedback_summary": (
                    "Interview completed. Review individual answer feedback "
                    "for strengths and areas to improve."
                ),
            },
        }

    next_q_data = result.get("next_question") or {}
    if not next_q_data.get("question_text"):
        # Fallback finish if AI returned no next question
        interview.status = "completed"
        db.commit()
        return {
            "evaluation": {
                "score": score,
                "feedback": feedback,
                "model_answer": model_answer,
            },
            "interview_finished": True,
            "final_result": {
                "overall_score": round(avg_score, 1),
                "feedback_summary": "Interview completed based on coverage of key topics.",
            },
        }

    sequence = (
        db.query(Question).filter(Question.interview_id == interview.id).count() + 1
    )

    next_question = Question(
        interview_id=interview.id,
        question_text=next_q_data["question_text"],
        expected_topics=next_q_data.get("expected_topics"),
        topic=next_q_data.get("topic"),
        question_type=next_q_data.get("question_type", "follow_up"),
        sequence_number=sequence,
        is_follow_up=bool(next_q_data.get("is_follow_up", True)),
    )
    db.add(next_question)
    db.commit()
    db.refresh(next_question)

    return {
        "evaluation": {
            "score": score,
            "feedback": feedback,
            "model_answer": model_answer,
        },
        "interview_finished": False,
        "next_question": {
            "id": next_question.id,
            "question_text": next_question.question_text,
        },
    }