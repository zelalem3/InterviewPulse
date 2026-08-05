from fastapi import APIRouter, status, HTTPException, Depends
from app.database.session import get_db
from app.models.models import User, CodingQuestion, CodingAnswer, Interview, Resume
from app.core.deps import get_current_user
from sqlalchemy.orm import Session
import os
import json
from pydantic import BaseModel
import google.generativeai as genai

class CodeQuestionModel(BaseModel):
    question_text: str
    interview_id: int

class CodeAnswerModel(BaseModel):
    question_id: int
    answer_text: str

router = APIRouter(prefix="/code", tags=["codesubmit"])

@router.get("/{interview_id}")
def coding_question(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if interview exists and belongs to user if needed
    is_interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not is_interview:
        raise HTTPException(status_code=404, detail="Interview not found")
        
    if is_interview.codequestions:
        return is_interview.codequestions
        
    result = generate_coding_question(interview_id, current_user.id, db)
    return result
class CodeAnswerCreate(BaseModel):
    answer_text: str

@router.post("/{question_id}/submit")
def submit_code(
    question_id: int,
    answer_data: CodeAnswerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Create the database model instance
    db_answer = CodingAnswer(
        question_id=question_id,
        answer_text=answer_data.answer_text
    )
    
    db.add(db_answer)
    db.commit()
    db.refresh(db_answer)
    
    return {"message": "Submitted successfully", "answer_id": db_answer.id}
def generate_coding_question(interview_id, user_id, db):
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    
   
    model = genai.GenerativeModel("gemini-3.6-flash")
    
    parsed_text = db.query(Resume).filter(Resume.user_id == user_id).order_by(Resume.id.desc()).first()
    resume_content = parsed_text.extracted_data if parsed_text else "General backend developer profile"

    prompt = f"""
        Generate coding questions for a junior backend developer position. 
        Based on the candidate's CV content below, generate 10 question texts (no answers).
        Return the output strictly in a JSON format as an array of objects with a key "question_text".
        
        CV Content:
        {resume_content}
    """
    
    response = model.generate_content(
        prompt,
        generation_config={"response_mime_type": "application/json"}
    )
    
    try:
        questions_data = json.loads(response.text)
        created_questions = []
        
        # Save generated questions to DB linked to this interview
        for q in questions_data:
            text = q.get("question_text") or q.get("text")
            if text:
                db_question = CodingQuestion(interview_id=interview_id, question_text=text)
                db.add(db_question)
                created_questions.append(db_question)
        
        db.commit()
        for q in created_questions:
            db.refresh(q)
            
        return created_questions
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to generate questions: {str(e)}")