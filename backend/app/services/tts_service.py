import os
import tempfile
import uuid
import wave
from functools import lru_cache
from pathlib import Path
from threading import Lock

from piper import PiperVoice


OUTPUT_DIR = os.getenv(
    "TTS_OUTPUT_DIR",
    os.path.join(tempfile.gettempdir(), "interviewpulse-audio"),
)
MODEL_PATH = (
    Path(__file__).resolve().parents[2]
    / "tts"
    / "models"
    / "en_US-amy-medium.onnx"
)

os.makedirs(OUTPUT_DIR, exist_ok=True)

_synthesis_lock = Lock()


@lru_cache(maxsize=1)
def _load_voice() -> PiperVoice:
    return PiperVoice.load(MODEL_PATH)


def generate_audio(text: str) -> str:
    output_path = os.path.join(OUTPUT_DIR, f"{uuid.uuid4()}.wav")
    try:
        with _synthesis_lock:
            voice = _load_voice()
            with wave.open(output_path, "wb") as wav_file:
                voice.synthesize_wav(text, wav_file)
    except Exception:
        try:
            os.remove(output_path)
        except FileNotFoundError:
            pass
        raise

    return output_path
