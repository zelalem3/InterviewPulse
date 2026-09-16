import os
import json
import time
import requests
from typing import Optional

# Optional imports – handled gracefully if missing
try:
    from groq import Groq
except ImportError:
    Groq = None

try:
    import google.generativeai as genai
    from google.api_core.exceptions import ResourceExhausted
except ImportError:
    genai = None
    ResourceExhausted = Exception


class LLMError(Exception):
    pass


def _parse_json(text: str) -> dict:
    text = (text or "").strip()
    text = text.replace("```json", "").replace("```", "").strip()
    return json.loads(text)


# ---------- Providers ----------

def _call_groq(prompt: str) -> dict:
    if Groq is None:
        raise LLMError("groq package not installed")
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise LLMError("GROQ_API_KEY not set")

    client = Groq(api_key=api_key)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",  # or llama-3.1-8b-instant
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
        response_format={"type": "json_object"},
    )
    return _parse_json(response.choices[0].message.content)


def _call_openrouter(prompt: str) -> dict:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise LLMError("OPENROUTER_API_KEY not set")

    # Free models – try a couple if one fails
    models = [
        "meta-llama/llama-3.3-70b-instruct:free",
        "meta-llama/llama-3.1-8b-instruct:free",
        "google/gemma-2-9b-it:free",
        "mistralai/mistral-7b-instruct:free",
    ]

    last_err = None
    for model in models:
        try:
            r = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:5173",
                    "X-Title": "InterviewPulse",
                },
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.4,
                },
                timeout=90,
            )
            if r.status_code == 429:
                last_err = f"OpenRouter 429 on {model}"
                time.sleep(2)
                continue
            r.raise_for_status()
            content = r.json()["choices"][0]["message"]["content"]
            return _parse_json(content)
        except Exception as e:
            last_err = e
            continue

    raise LLMError(f"OpenRouter failed: {last_err}")


def _call_gemini(prompt: str) -> dict:
    if genai is None:
        raise LLMError("google-generativeai not installed")

    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise LLMError("GEMINI_API_KEY not set")

    genai.configure(api_key=api_key)

    models = [
        "models/gemini-2.0-flash",
        "models/gemini-1.5-flash",
        "models/gemini-1.5-flash-8b",
    ]

    last_err = None
    for model_name in models:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            return _parse_json(response.text)
        except ResourceExhausted as e:
            last_err = e
            time.sleep(5)
            continue
        except Exception as e:
            last_err = e
            continue

    raise LLMError(f"Gemini failed: {last_err}")


# ---------- Public API ----------

def call_llm(prompt: str, max_retries: int = 1) -> dict:
    """
    Try providers in order until one succeeds.
    Order: Groq → OpenRouter → Gemini
    """
    providers = [
        ("Groq", _call_groq),
        ("OpenRouter", _call_openrouter),
        ("Gemini", _call_gemini),
    ]

    errors = []

    for name, fn in providers:
        for attempt in range(max_retries + 1):
            try:
                print(f"[LLM] Trying {name} (attempt {attempt + 1})...")
                result = fn(prompt)
                print(f"[LLM] Success with {name}")
                return result
            except Exception as e:
                msg = f"{name}: {e}"
                print(f"[LLM] {msg}")
                errors.append(msg)
                time.sleep(1 + attempt * 2)

    raise LLMError("All LLM providers failed: " + " | ".join(errors))