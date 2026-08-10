import os
import uuid
import asyncio

import edge_tts


OUTPUT_DIR = "/app/tts/audio"

os.makedirs(
    OUTPUT_DIR,
    exist_ok=True
)


VOICE = "en-US-AriaNeural"


async def _generate(text: str, output: str):
    communicate = edge_tts.Communicate(
        text=text,
        voice=VOICE
    )

    await communicate.save(output)


def generate_audio(text: str):

    filename = f"{uuid.uuid4()}.mp3"

    output_path = os.path.join(
        OUTPUT_DIR,
        filename
    )

    asyncio.run(
        _generate(
            text,
            output_path
        )
    )

    return output_path