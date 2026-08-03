from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from app.database.session import get_db
from app.models.models import Resume, User
from app.schemas.resume import ResumeResponse
from sqlalchemy.orm import Session
import os
import shutil 
from app.core.deps import get_current_user
from pypdf import PdfReader
from typing import List
import google.generativeai as genai


router = APIRouter(prefix="/resume", tags=["resume"])

UPLOAD_DIR = "app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF resume files are supported at this time"
        )
    file_path = os.path.join(UPLOAD_DIR, f"user_{current_user.id}_{file.filename}")
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not save uploaded file: {str(e)}"
        )
    parsed_text = ""
    try:
        reader = PdfReader(file_path)
        for page in reader.pages:
            text = page.extract_text()
            if text:
                parsed_text += text + "\n"
    except Exception:
        parsed_text = "Could not parse text automatically."
    extract_skills = extract_text(parsed_text)
        
    new_resume = Resume(
        user_id=current_user.id,
        file_path=file_path,
        parsed_content=parsed_text.strip(),
        extracted_data = extract_skills
    )
    
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)

    return new_resume


@router.get("/", response_model=List[ResumeResponse])
async def list_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    return resumes


def extract_text(parsed_text):
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    
    # Use an active current model string
    model = genai.GenerativeModel("gemini-3.6-flash")
    
    prompt = f"""
    I want you to extract the text, experience, projects, and education of the CV 
    and give me the output back strictly in a JSON format.
    
    CV Content:
    {parsed_text}
    """
    
    response = model.generate_content(
        prompt,
        generation_config={"response_mime_type": "application/json"}
    )
    
    return response.text