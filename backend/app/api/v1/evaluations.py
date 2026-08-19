import json
import logging
import os
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database.session import get_db
from app.models.models import (
    Answer,
    CodingAnswer,
    CodingQuestion,
    Interview,
    Question,
    Result,
    User,
)
from app.schemas.result import ResultResponse


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/interviews",
    tags=["Evaluations"],
)


# ============================================================
# Gemini structured response schemas
# ============================================================

class EvaluationCategories(BaseModel):
    technical_depth: float = Field(
        ge=0,
        le=10,
        description=(
            "Technical accuracy, conceptual understanding, "
            "depth of knowledge, and ability to explain technical concepts."
        ),
    )

    problem_solving: float = Field(
        ge=0,
        le=10,
        description=(
            "Problem-solving ability, logical reasoning, "
            "approach to difficult problems, and ability to reason through solutions."
        ),
    )

    communication: float = Field(
        ge=0,
        le=10,
        description=(
            "Clarity, structure, precision, confidence, "
            "and effectiveness of the candidate's verbal/theory responses."
        ),
    )

    code_implementation: float = Field(
        ge=0,
        le=10,
        description=(
            "Code correctness, algorithmic quality, complexity, "
            "edge-case handling, readability, maintainability, and implementation quality."
        ),
    )


class DetailedBreakdown(BaseModel):
    question_type: str = Field(
        description="Either 'theory' or 'coding'."
    )

    index: int = Field(
        ge=1,
        description="1-based index of the question within its question type."
    )

    score: float = Field(
        ge=0,
        le=10,
        description="Score for this individual question from 0 to 10."
    )

    critique: str = Field(
        description=(
            "Specific and actionable feedback explaining what the candidate "
            "did well, what was weak, and how they could improve."
        )
    )


class InterviewEvaluation(BaseModel):
    overall_score: float = Field(
        ge=0,
        le=10,
        description=(
            "Overall candidate performance score from 0 to 10. "
            "This should reflect the complete interview."
        ),
    )

    categories: EvaluationCategories

    feedback_summary: str = Field(
        description=(
            "Comprehensive but concise summary of the candidate's performance, "
            "major strengths, weaknesses, and most important improvement areas."
        )
    )

    detailed_breakdown: List[DetailedBreakdown] = Field(
        description=(
            "Individual feedback for every theory and coding question supplied "
            "in the evaluation input."
        )
    )


# ============================================================
# Main evaluation endpoint
# ============================================================

@router.post(
    "/{interview_id}/evaluate",
    response_model=ResultResponse,
    status_code=status.HTTP_201_CREATED,
)
async def evaluate_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Evaluate a completed interview using Gemini.

    The evaluation considers:

    - Theory/verbal answers
    - Coding challenges
    - Submitted code
    - Candidate's latest resume/CV

    The generated evaluation is stored in the Result table.
    """

    # ========================================================
    # 1. Find interview
    # ========================================================

    interview = (
        db.query(Interview)
        .filter(
            Interview.id == interview_id,
            Interview.user_id == current_user.id,
        )
        .first()
    )

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found",
        )

    # ========================================================
    # 2. Gather theory questions and answers
    # ========================================================

    questions = (
        db.query(Question)
        .filter(Question.interview_id == interview.id)
        .all()
    )

    interview_data = []

    for index, question in enumerate(questions, start=1):

        answer = (
            db.query(Answer)
            .filter(Answer.question_id == question.id)
            .first()
        )

        interview_data.append(
            {
                "type": "theory_question",
                "index": index,
                "question_id": question.id,
                "question": question.question_text,
                "expected_topics": getattr(
                    question,
                    "expected_topics",
                    "General technical competency",
                ),
                "answer": (
                    answer.answer_text
                    if answer and answer.answer_text
                    else "No answer provided"
                ),
            }
        )

    # ========================================================
    # 3. Gather coding questions and submissions
    # ========================================================

    coding_questions = (
        db.query(CodingQuestion)
        .filter(CodingQuestion.interview_id == interview.id)
        .all()
    )

    coding_data = []

    for index, coding_question in enumerate(coding_questions, start=1):

        coding_answer = (
            db.query(CodingAnswer)
            .filter(
                CodingAnswer.question_id == coding_question.id
            )
            .first()
        )

        coding_data.append(
            {
                "type": "coding_challenge",
                "index": index,
                "question_id": coding_question.id,
                "question": coding_question.question_text,
                "candidate_code": (
                    coding_answer.answer_text
                    if coding_answer and coding_answer.answer_text
                    else "No code submitted"
                ),
            }
        )

    # ========================================================
    # 4. Make sure there is something to evaluate
    # ========================================================

    if not interview_data and not coding_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "No questions or coding challenges found "
                "for this interview evaluation."
            ),
        )

    # ========================================================
    # 5. Get latest resume
    # ========================================================

    latest_resume = (
        current_user.resumes[-1]
        if current_user.resumes
        else None
    )

    if latest_resume and latest_resume.extracted_data:
        resume_data = latest_resume.extracted_data
    else:
        resume_data = "No resume data available."

    # ========================================================
    # 6. Generate AI evaluation
    # ========================================================

    try:
        evaluation = generate_comprehensive_evaluation(
            interview_data=interview_data,
            coding_data=coding_data,
            resume_data=resume_data,
        )

    except Exception as exc:
        logger.exception(
            "Gemini evaluation failed for interview %s",
            interview_id,
        )

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "AI evaluation service failed. "
                "Please try again later."
            ),
        ) from exc

    # ========================================================
    # 7. Prepare result data
    # ========================================================

    overall_score = round(
        float(evaluation.overall_score),
        2,
    )

    feedback_payload = {
        "summary": evaluation.feedback_summary,
        "categories": evaluation.categories.model_dump(),
        "detailed_breakdown": [
            item.model_dump()
            for item in evaluation.detailed_breakdown
        ],
    }

    feedback_json_str = json.dumps(
        feedback_payload,
        ensure_ascii=False,
    )

    # ========================================================
    # 8. Save/update result
    # ========================================================

    existing_result = (
        db.query(Result)
        .filter(Result.interview_id == interview.id)
        .first()
    )

    if existing_result:

        existing_result.overall_score = overall_score
        existing_result.feedback_summary = feedback_json_str

        db.commit()
        db.refresh(existing_result)

        result_record = existing_result

    else:

        result_record = Result(
            interview_id=interview.id,
            overall_score=overall_score,
            feedback_summary=feedback_json_str,
        )

        db.add(result_record)

        db.commit()
        db.refresh(result_record)

    # ========================================================
    # 9. Mark interview as completed
    # ========================================================

    interview.status = "completed"

    db.commit()
    db.refresh(interview)

    return result_record


# ============================================================
# Gemini evaluation
# ============================================================

def generate_comprehensive_evaluation(
    interview_data: list,
    coding_data: list,
    resume_data,
) -> InterviewEvaluation:
    """
    Send the complete interview to Gemini and return
    a validated Pydantic evaluation object.
    """

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY environment variable is not configured."
        )

    # ========================================================
    # Create Gemini client
    # ========================================================

    client = genai.Client(
        api_key=api_key,
    )

    # ========================================================
    # Build prompt
    # ========================================================

    prompt = f"""
You are an expert technical hiring manager, senior software engineer,
and principal interviewer.

Your task is to evaluate a candidate's complete technical interview.

You must evaluate the candidate based ONLY on the evidence provided
in the CV, theory answers, and coding submissions.

Do not assume the candidate knows something simply because it appears
on their CV.

============================================================
CANDIDATE CV
============================================================

{resume_data}


============================================================
THEORY / VERBAL QUESTIONS
============================================================

{json.dumps(interview_data, indent=2, ensure_ascii=False)}


============================================================
CODING CHALLENGES
============================================================

{json.dumps(coding_data, indent=2, ensure_ascii=False)}


============================================================
EVALUATION CRITERIA
============================================================

Evaluate the candidate across these four categories:

1. Technical Accuracy & Conceptual Depth

Consider:

- Correctness of technical explanations
- Understanding of underlying concepts
- Ability to explain why something works
- Ability to distinguish related concepts
- Depth beyond memorized definitions
- Technical precision


2. Problem Solving & Logic

Consider:

- Reasoning process
- Ability to break down problems
- Logical thinking
- Handling ambiguity
- Identifying edge cases
- Algorithmic thinking
- Ability to improve an initial approach


3. Communication & Clarity

Consider:

- Clarity
- Structure
- Conciseness
- Ability to explain technical ideas
- Ability to justify decisions
- Whether answers directly address questions


4. Code Implementation

Consider:

- Correctness
- Algorithmic approach
- Time complexity
- Space complexity
- Edge cases
- Readability
- Maintainability
- Naming
- Error handling
- Appropriate use of language features
- Overall engineering quality


============================================================
IMPORTANT SCORING RULES
============================================================

Every score must be between 0 and 10.

Use the following general interpretation:

0-2:
Very poor understanding or unusable implementation.

3-4:
Significant weaknesses and limited understanding.

5-6:
Basic/acceptable understanding but substantial gaps.

7-8:
Good professional-level performance with some weaknesses.

9:
Excellent performance with very minor weaknesses.

10:
Exceptional performance demonstrating deep expertise.

Do NOT automatically give 7.

The score must reflect the actual evidence in the candidate's responses.

If an answer is missing, evaluate it as missing rather than assuming
the candidate knew the answer.

For coding submissions:

- Carefully inspect the actual code.
- Do not claim code is correct if it contains errors.
- Identify algorithmic complexity where possible.
- Mention important edge cases.
- Distinguish syntax errors from logical errors.
- Distinguish a correct solution from an optimized solution.


============================================================
CV ALIGNMENT
============================================================

Compare the candidate's demonstrated interview performance against
the technologies and experience represented in the CV.

If the CV claims experience with a technology but the interview shows
weak understanding, mention that discrepancy.

Do not penalize the candidate merely because a technology is absent
from the CV.

============================================================
DETAILED FEEDBACK
============================================================

Provide feedback for every supplied theory question.

Provide feedback for every supplied coding question.

For each item:

- Explain what was done well.
- Explain what was wrong or incomplete.
- Explain how the candidate could improve.
- For coding questions, discuss implementation quality and complexity
  when relevant.

Do not invent questions that are not present in the input.

============================================================
OVERALL EVALUATION
============================================================

The overall score should represent the candidate's complete performance.

The final summary should:

- Identify the strongest areas.
- Identify the weakest areas.
- Explain the candidate's current technical level.
- Give actionable recommendations.
- Be honest but constructive.
- Avoid generic motivational language.
"""

    # ========================================================
    # Call Gemini with structured output
    # ========================================================

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=InterviewEvaluation,
        ),
    )

    # ========================================================
    # Validate response
    # ========================================================

    if not response.text:
        raise RuntimeError(
            "Gemini returned an empty response."
        )

    try:
        evaluation = InterviewEvaluation.model_validate_json(
            response.text
        )

    except Exception as exc:

        logger.error(
            "Gemini returned invalid evaluation JSON: %s",
            response.text,
        )

        raise RuntimeError(
            "Gemini returned an invalid evaluation format."
        ) from exc

    return evaluation