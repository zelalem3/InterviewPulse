import logging
import os

from fastapi import APIRouter
from fastapi import HTTPException
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask
from pydantic import BaseModel
from app.services.tts_service import generate_audio

router = APIRouter(prefix="/tts", tags=["tts"])
logger = logging.getLogger(__name__)

class TTSRequest(BaseModel):
    text: str

@router.post("/generate")
def generate(request: TTSRequest):
    try:
        audio_path = generate_audio(request.text)
    except Exception as error:
        logger.exception("TTS generation failed")
        raise HTTPException(
            status_code=503,
            detail="Speech generation is temporarily unavailable.",
        ) from error

    return FileResponse(
        audio_path,
        media_type="audio/mpeg",
        filename="interview.mp3",
        background=BackgroundTask(os.remove, audio_path),
    )