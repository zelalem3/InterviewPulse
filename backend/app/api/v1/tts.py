from fastapi import APIRouter
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.services.tts_service import generate_audio


router = APIRouter(
    prefix="/tts",
    tags=["tts"]
)


class TTSRequest(BaseModel):
    text: str



@router.post("/generate")
def generate(
    request: TTSRequest
):

    audio_path = generate_audio(
        request.text
    )

    return FileResponse(
        audio_path,
        media_type="audio/wav",
        filename="interview.wav"
    )