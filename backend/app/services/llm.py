import os
import json
import time
import requests

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None
    types = None


class LLMError(Exception):
    pass


def _parse_json(text: str) -> dict:
    text = (text or "").strip()
    text = text.replace("```json", "").replace("```", "").strip()
    return json.loads(text)


# ---------- Providers ----------

def _call_openrouter(prompt: str) -> dict:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise LLMError("OPENROUTER_API_KEY not set")

    models = [
        os.getenv("OPENROUTER_MODEL", "inclusionai/ling-3.2-flash:free"),
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
                    "response_format": {"type": "json_object"},
                },
                timeout=90,
            )
            if r.status_code == 429:
                last_err = f"OpenRouter 429 on {model}"
                time.sleep(2)
                continue
            if not r.ok:
                try:
                    error_detail = r.json().get("error", {}).get("message")
                except ValueError:
                    error_detail = None
                last_err = (
                    f"OpenRouter HTTP {r.status_code}: "
                    f"{error_detail or r.text[:500]}"
                )
                continue
            content = r.json()["choices"][0]["message"]["content"]
            return _parse_json(content)
        except Exception as e:
            last_err = e
            continue

    raise LLMError(f"OpenRouter failed: {last_err}")


def _call_gemini(prompt: str) -> dict:
    if genai is None:
        raise LLMError("google-genai package not installed")
    if types is None:
        raise LLMError("google-genai types are unavailable")

    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise LLMError("GEMINI_API_KEY not set")

    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model=os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite"),
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.4,
        ),
    )
    if not response.text:
        raise LLMError("Gemini returned an empty response")
    return _parse_json(response.text)


# ---------- Public API ----------

def call_llm(prompt: str, max_retries: int = 1) -> dict:
    """
    Try providers in order until one succeeds.
    Order: Gemini → OpenRouter (free models)
    """
    providers = [
        ("Gemini", _call_gemini),
        ("OpenRouter", _call_openrouter),
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