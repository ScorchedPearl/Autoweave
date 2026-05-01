"""
Intent extractor — the ONLY place AI is used in the workflow builder.

Supported providers (selected by the user via frontend dropdown):
  "openai"  — OpenAI Chat API  (gpt-3.5-turbo)
  "gemini"  — Google Gemini API (gemini-1.5-flash)
  "claude"  — Anthropic Claude API (claude-haiku-4-5-20251001)

Each provider uses the user's own API key — nothing is stored server-side.

Returns an ordered list of short intent phrases, e.g.:
  ["translate to french", "summarize", "send email to alice@example.com"]

Output is a strict JSON array — no prose, no markdown.
Any parse failure falls back to [prompt] so the caller always gets a list.
"""

import json
import logging
import re
from typing import List

logger = logging.getLogger(__name__)


_SYSTEM_PROMPT = """\
You are a workflow intent parser. The user will describe a multi-step workflow in plain English.

Your ONLY job: extract the ordered list of operations they want to perform.

Rules:
1. Return ONLY a valid JSON array of short strings. No prose, no markdown, no explanation.
2. Each string should be 2-6 words describing ONE operation.
3. Preserve important detail (e.g. target language, algorithm, email address, URL, port).
4. Maximum 10 items.

Example input: "translate my text to french, summarize the result, then email it to john@example.com"
Example output: ["translate to french", "summarize", "send email to john@example.com"]

Example input: "scan ports 80 and 443 on example.com then check the ssl cert"
Example output: ["scan ports 80,443 on example.com", "check ssl cert example.com"]
"""



def extract_intents(prompt: str, api_key: str, provider: str = "openai") -> List[str]:
    """
    Dispatch to the correct provider and return an ordered list of intent phrases.

    Parameters
    ----------
    prompt   : user's free-text workflow description
    api_key  : the user's own API key for the chosen provider
    provider : "openai" | "gemini" | "claude"

    Raises ValueError if api_key is blank.
    Falls back to [prompt] on any LLM or parse failure.
    """
    if not api_key or not api_key.strip():
        raise ValueError(f"An API key is required for provider '{provider}'.")

    provider = provider.lower().strip()
    dispatch = {
        "openai": _call_openai,
        "gemini": _call_gemini,
        "claude": _call_claude,
    }
    fn = dispatch.get(provider)
    if fn is None:
        raise ValueError(f"Unsupported provider '{provider}'. Choose: openai, gemini, claude.")

    try:
        raw = fn(prompt.strip(), api_key.strip())
        logger.debug("Intent extractor [%s] raw response: %s", provider, raw)
        return _parse_response(raw, prompt)
    except ValueError:
        raise
    except Exception as exc:
        logger.warning("Intent extraction failed [%s]: %s — falling back to raw prompt", provider, exc)
        return [prompt.strip()]



def _call_openai(prompt: str, api_key: str) -> str:
    import openai
    client = openai.OpenAI(api_key=api_key)
    resp = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0,
        max_tokens=200,
    )
    return resp.choices[0].message.content.strip()


def _call_gemini(prompt: str, api_key: str) -> str:
    import google.generativeai as genai
    genai.configure(api_key=api_key)

    model = genai.GenerativeModel("gemini-2.5-flash")
    resp = model.generate_content(
        f"{_SYSTEM_PROMPT}\n\nUser request: {prompt}",
        generation_config={"temperature": 0, "max_output_tokens": 200},
    )
    return resp.text.strip()


def _call_claude(prompt: str, api_key: str) -> str:
    import anthropic
    client = anthropic.Anthropic(api_key=api_key)
    msg = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=200,
        system=_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )
    return msg.content[0].text.strip()




def _parse_response(raw: str, original_prompt: str) -> List[str]:

    cleaned = re.sub(r"^```[a-z]*\n?", "", raw.strip())
    cleaned = re.sub(r"\n?```$", "", cleaned.strip())

    try:
        intents: List[str] = json.loads(cleaned)
        if isinstance(intents, list) and all(isinstance(i, str) for i in intents):
            return [i.strip() for i in intents if i.strip()]
    except (json.JSONDecodeError, TypeError):
        pass

    logger.warning("Could not parse intent list from response — using raw prompt as single intent")
    return [original_prompt.strip()]
