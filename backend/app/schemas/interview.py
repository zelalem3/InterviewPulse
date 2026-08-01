from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class InterviewCreate(BaseModel):
    resume_id: int
    job_role: str

class InterviewResponse(BaseModel):
    id: int
    user_id: int
    resume_id: int
    job_role: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True