from pydantic import BaseModel
from typing import Optional

from datetime import datetime


class ResultResponse(BaseModel):
    id: int
    interview_id: int
    overall_score: Optional[float] = None
    feedback_summary: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True