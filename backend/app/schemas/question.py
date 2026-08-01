from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class QuestionResponse(BaseModel):
    id: int
    interview_id: int
    question_text: str
    expected_topics: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class QuestionListResponse(BaseModel):
    questions: List[QuestionResponse]