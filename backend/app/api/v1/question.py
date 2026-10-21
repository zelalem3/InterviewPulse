# backend/app/api/v1/question.py
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import User, Interview, Resume, Question, Answer
from app.core.deps import get_current_user
from app.services.llm import call_llm, LLMError

router = APIRouter(prefix="/interviews", tags=["Conversational Interview"])


FALLBACK_QUESTIONS = [
    "Tell me about a challenging technical problem you solved recently.",
    "How would you design a REST API for a high-traffic application?",
    "Explain how you would diagnose and fix a slow database query.",
    "Describe a system design decision you made and the trade-offs involved.",
    "How do you ensure code quality and reliability in a team environment?",
    "Walk me through how you would approach debugging a production outage.",
]


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


def generate_first_question(resume_text: str, job_role: str) -> dict:
    """Generate the opening question for a junior technical interview."""
    prompt = f"""
You are an encouraging and fair interviewer conducting a technical interview for a Junior candidate.

Job role: {job_role}
Candidate resume: {resume_text}

Task:
Generate exactly ONE clear, low-pressure opening technical question that is appropriate for a junior candidate.
The question should be short, single-focused, and based on the resume or the target role.

Clarity & Anxiety-Reduction Rules:
- Keep the question short, single-focused, and direct (avoid multi-part or trick questions).
- Use clear, non-intimidating phrasing (e.g., "Could you briefly explain...", "In your own words...", "How would you approach...").
- Never ask high-pressure system architecture questions or demand deep theoretical edge cases.
- Prefer a practical, everyday coding or problem-solving scenario.

Return ONLY valid JSON with no markdown formatting:
{{
  "question_text": "Clear, low-friction technical question",
  "expected_topics": ["topic1", "topic2"],
  "topic": "Main concept",
  "question_type": "initial",
  "is_follow_up": false
}}
"""
    try:
        result = call_llm(prompt)
        # Normalise in case the model returns extra keys
        return {
            "question_text": result.get("question_text")
            or "Tell me about yourself and your relevant experience.",
            "expected_topics": result.get("expected_topics"),
            "topic": result.get("topic"),
            "question_type": result.get("question_type", "initial"),
            "is_follow_up": bool(result.get("is_follow_up", False)),
        }
    except LLMError as e:
        print(f"[LLM] First question fallback: {e}")
        return {
            "question_text": FALLBACK_QUESTIONS[0],
            "expected_topics": "General experience",
            "topic": "Introduction",
            "question_type": "initial",
            "is_follow_up": False,
        }


def evaluate_and_next(
    resume_text: str,
    job_role: str,
    question_text: str,
    answer_text: str,
    expected_topics: str | None,
    history: list,
) -> dict:
    prompt = f"""
You are an encouraging and fair interviewer conducting a technical interview for a Junior candidate.

Job role: {job_role}
Candidate resume: {resume_text}

Current question: {question_text}
Expected topics: {expected_topics}
Candidate answer: {answer_text}

Previous conversation history:
{json.dumps(history, indent=2)}

Tasks:
1. Evaluate the answer fairly for an entry-level candidate (score 0-10).
2. Decide whether to continue or wrap up.
3. If continuing, ask exactly ONE straightforward next question or follow-up.

Guidelines for Junior Evaluation & Questions:
- Be encouraging in feedback; evaluate based on core understanding rather than senior-level nuance.
- Keep follow-ups supportive (e.g., ask for clarification or a simple example if they missed a concept).
- Transition smoothly to another foundational concept if the current topic is complete.
- Aim for roughly 4 to 5 total questions to keep the session clear and concise.

Return ONLY valid JSON with no markdown formatting:
{{
  "evaluation": {{
    "score": 7.5,
    "feedback": "Constructive, encouraging feedback tailored for a junior developer.",
    "model_answer": "Clear, direct example answer covering the key points."
  }},
  "interview_finished": false,
  "next_question": {{
    "question_text": "Next clear technical question or simple follow-up",
    "expected_topics": ["topic1", "topic2"],
    "topic": "Main concept",
    "question_type": "follow_up",
    "is_follow_up": true
  }}
}}

If interview_finished is true, include the evaluation and set next_question to null.
"""
    try:
        return call_llm(prompt)
    except LLMError as e:
        print(f"[LLM] Evaluate/next fallback: {e}")
        n = len([h for h in history if h.get("answer")])
        finished = n >= 4
        return {
            "evaluation": {
                "score": 6.0,
                "feedback": "Answer recorded. Full AI evaluation temporarily unavailable.",
                "model_answer": "",
            },
            "interview_finished": finished,
            "next_question": None
            if finished
            else {
                "question_text": FALLBACK_QUESTIONS[n % len(FALLBACK_QUESTIONS)],
                "expected_topics": "General",
                "topic": "General",
                "question_type": "fallback",
                "is_follow_up": False,
            },
        }


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
        question_text=q_data.get("question_text")
        or "Tell me about yourself and your relevant experience.",
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

    history = get_interview_history(interview.id, db)

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

    history = get_interview_history(interview.id, db)
    answered = [h for h in history if h.get("answer")]
    avg_score = (
        sum((h.get("score") or 0) for h in answered) / len(answered)
        if answered
        else 0
    )

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