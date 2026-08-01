from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ResumeResponse(BaseModel):
    id: int
    user_id: int
    file_path: str
    parsed_content: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True