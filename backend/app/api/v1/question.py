import os
import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models.models import User, Interview, Resume, Question, Answer
from app.schemas.question import QuestionResponse
from app.core.deps import get_current_user
import google.generativeai as genai

router = APIRouter(prefix="/questions", tags=["Questions"])

@router.post("/{interview_id}/generate-questions", response_model=List[QuestionResponse], status_code=status.HTTP_201_CREATED)
async def generate_interview_questions(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )

    resume = db.query(Resume).filter(Resume.id == interview.resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated resume not found"
        )

    existing_questions = db.query(Question).filter(Question.interview_id == interview.id).all()
    if existing_questions:
        return existing_questions

    # Use the retrieved resume's extracted data properly
    raw_ai_questions = generate_question(resume.extracted_data, interview.job_role)
    
    try:
        generated_questions_list = json.loads(raw_ai_questions)
    except json.JSONDecodeError:
        generated_questions_list = [
            {
                "question_text": f"Can you walk me through a complex project from your resume where you applied skills relevant to a {interview.job_role}?",
                "expected_topics": "Architecture, problem-solving, tech stack choices"
            }
        ]

    created_questions = []
    for q_data in generated_questions_list:
        db_question = Question(
            interview_id=interview.id,
            question_text=q_data.get("question_text", "Technical query"),
            expected_topics=q_data.get("expected_topics", "General fundamentals")
        )
        db.add(db_question)
        db.commit()
        db.refresh(db_question)
        created_questions.append(db_question)

    interview.status = "in_progress"
    db.commit()

    return created_questions


@router.get("/{interview_id}", response_model=List[QuestionResponse])
async def get_interview_questions(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()

    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found")

    questions = db.query(Question).filter(Question.interview_id == interview.id).all()
    return questions


@router.post('/{question_id}/evaluate-single')
def evaluate_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Locate question and verify interview ownership
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    interview = db.query(Interview).filter(
        Interview.id == question.interview_id,
        Interview.user_id == current_user.id
    ).first()
    
    if not interview:
        raise HTTPException(status_code=403, detail="Unauthorized access to interview")

    # 2. Grab the candidate's resume data
    resume = db.query(Resume).filter(Resume.id == interview.resume_id).first()
    resume_text = resume.extracted_data if resume else "No resume data available"

    # 3. Call AI evaluation generator
    ai_response_raw = generate_answer(question_id, resume_text, db, current_user)
    
    try:
        return json.loads(ai_response_raw)
    except json.JSONDecodeError:
        return {
            "model_answer": "Standard model response unavailable.",
            "score": 7.0,
            "feedback": ai_response_raw
        }


def generate_question(parsed_text, job_role="Junior Full-Stack Developer"):
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
            
    model = genai.GenerativeModel("gemini-3.6-flash")
    
    prompt = f"""
    You are an expert technical interviewer. Based on the candidate's resume/CV content provided below, generate a list of 5 tailored interview questions for a {job_role} position.
    
    You must return the response strictly as a JSON array of objects, where each object has the following keys:
    - "question_text": The interview question itself, referencing their specific skills or projects.
    - "expected_topics": Key technical areas or concepts the answer should touch upon.

    CV Content:
    {parsed_text}
    """
    
    response = model.generate_content(
        prompt,
        generation_config={"response_mime_type": "application/json"}
    )
    
    return response.text


def generate_answer(question_id: int, parsed_text: str, db, current_user):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    
    model = genai.GenerativeModel("gemini-3.6-flash")
    
    prompt = f"""
    You are an expert technical interviewer. Review the candidate's CV details and the specific interview question below.
    Provide a comprehensive model answer, an evaluation score (out of 10), and constructive feedback summary.
    
    Target Question: {question.question_text}
    Expected Topics: {question.expected_topics}
    
    Candidate CV Content:
    {parsed_text}
    
    Return the result strictly as a JSON object with the following keys:
    - "model_answer": "Detailed breakdown of how a top candidate should answer this."
    - "score": 7.0 (a float value out of 10)
    - "feedback": "Constructive summary of strengths and areas for improvement."
    """
    
    response = model.generate_content(
        prompt,
        generation_config={"response_mime_type": "application/json"}
    )
    
    return response.text
@router.post("/{interview_id}/follow-up", response_model=[]) # or return a JSON array
def generate_followup_questions(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found")

    resume = db.query(Resume).filter(Resume.id == interview.resume_id).first()
    parsed_text = resume.extracted_data if resume else "No resume data available"

    questions = db.query(Question).filter(Question.interview_id == interview_id).all()
    q_and_a_history = []
    for q in questions:
        ans = db.query(Answer).filter(Answer.question_id == q.id).first()
        q_and_a_history.append({
            "question": q.question_text,
            "expected_topics": q.expected_topics,
            "answer": ans.answer_text if ans else "No answer provided"
        })

    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel("gemini-3.6-flash")
    
    prompt = f"""
    You are an expert technical interviewer conducting a mock interview for a {interview.job_role} position. 
    Review the candidate's CV content and their Q&A performance history below. 
    Generate a sequence of exactly **10 progressive follow-up technical questions** to thoroughly probe their depth of knowledge.
    
    Candidate CV Content:
    {parsed_text}
    
    Previous Interview Q&A History:
    {json.dumps(q_and_a_history, indent=2)}
    
    Return the result strictly as a JSON array of objects with the following keys:
    - "follow_up_question": "The text of the follow-up question."
    - "expected_topics": "Key technical areas or concepts."
    - "rationale": "Brief reason explaining why this follow-up was chosen."
    """
    
    response = model.generate_content(
        prompt,
        generation_config={"response_mime_type": "application/json"}
    )
    
    try:
        return json.loads(response.text)
    except json.JSONDecodeError:
        return []