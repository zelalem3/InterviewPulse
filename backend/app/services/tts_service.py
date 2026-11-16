import os
import tempfile
import uuid
from functools import lru_cache
from pathlib import Path
from threading import Lock

import soundfile
from kokoro_onnx import Kokoro


OUTPUT_DIR = os.getenv(
    "TTS_OUTPUT_DIR",
    os.path.join(tempfile.gettempdir(), "interviewpulse-audio"),
)
MODEL_DIR = Path(__file__).resolve().parents[2] / "tts" / "models"
MODEL_PATH = Path(
    os.getenv("KOKORO_MODEL_PATH", str(MODEL_DIR / "kokoro-v1.0.onnx"))
)
VOICES_PATH = Path(
    os.getenv("KOKORO_VOICES_PATH", str(MODEL_DIR / "voices-v1.0.bin"))
)
VOICE = os.getenv("KOKORO_VOICE", "af_sarah")

os.makedirs(OUTPUT_DIR, exist_ok=True)

_synthesis_lock = Lock()


@lru_cache(maxsize=1)
def _load_kokoro() -> Kokoro:
    missing_paths = [
        path for path in (MODEL_PATH, VOICES_PATH) if not path.is_file()
    ]
    if missing_paths:
        missing = ", ".join(str(path) for path in missing_paths)
        raise FileNotFoundError(f"Kokoro model assets are missing: {missing}")

    return Kokoro(str(MODEL_PATH), str(VOICES_PATH))


def generate_audio(text: str) -> str:
    output_path = os.path.join(OUTPUT_DIR, f"{uuid.uuid4()}.wav")
    try:
        with _synthesis_lock:
            kokoro = _load_kokoro()
            samples, sample_rate = kokoro.create(
                text,
                voice=VOICE,
                speed=1.0,
                lang="en-us",
            )
            soundfile.write(
                output_path,
                samples,
                sample_rate,
                format="WAV",
                subtype="PCM_16",
            )
    except Exception:
        try:
            os.remove(output_path)
        except FileNotFoundError:
            pass
        raise

    return output_path
