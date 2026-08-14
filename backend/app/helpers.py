"""Core Helpers & Web Engine for Voice_APP — Powered by OpenAI and Groq.

Provides seamless integration with OpenAI and Groq APIs for real-time voice,
Generative UI, and interactive agent interactions in Web Browsers and Jupyter Notebooks.
"""
from __future__ import annotations

import json
import os
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional

import requests
from dotenv import load_dotenv, find_dotenv

# Default model definitions
DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile"
DEFAULT_OPENAI_MODEL = "gpt-4o-mini"

def load_env() -> None:
    """Load environment variables from .env file searching parent directories."""
    dotenv_path = find_dotenv(usecwd=True)
    if dotenv_path:
        load_dotenv(dotenv_path)
    else:
        # Fallback to root project .env
        root_env = Path(__file__).resolve().parent.parent / ".env"
        if root_env.exists():
            load_dotenv(root_env)

def get_api_key(provider: str = "groq") -> str:
    """Retrieve API key for specified provider ('groq' or 'openai')."""
    load_env()
    provider = provider.lower()
    if provider == "groq":
        key = os.getenv("GROQ_API_KEY")
        if not key:
            raise ValueError("GROQ_API_KEY is missing in .env file.")
        return key
    elif provider == "openai":
        key = os.getenv("OPENAI_API_KEY")
        if not key:
            raise ValueError("OPENAI_API_KEY is missing in .env file.")
        return key
    else:
        raise ValueError(f"Unsupported provider '{provider}'. Choose 'groq' or 'openai'.")

def call_ai_agent(
    messages: List[Dict[str, str]],
    provider: str = "groq",
    model: Optional[str] = None
) -> Dict[str, Any]:
    """Call Groq or OpenAI chat completions API directly with function calling capabilities."""
    load_env()
    provider = provider.lower()
    api_key = get_api_key(provider)

    tools = [
        {
            "type": "function",
            "function": {
                "name": "place_mark",
                "description": "Place the AI's mark (O or X) on the tic-tac-toe board.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "row": {"type": "integer", "description": "Row index (1 = top, 2 = middle, 3 = bottom)"},
                        "col": {"type": "integer", "description": "Column index (1 = left, 2 = center, 3 = right)"}
                    },
                    "required": ["row", "col"]
                }
            }
        }
    ]

    if provider == "groq":
        endpoint = "https://api.groq.com/openai/v1/chat/completions"
        target_model = model or DEFAULT_GROQ_MODEL
    else:
        endpoint = "https://api.openai.com/v1/chat/completions"
        target_model = model or DEFAULT_OPENAI_MODEL

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": target_model,
        "messages": messages,
        "tools": tools,
        "tool_choice": "required",
        "temperature": 0.3
    }

    res = requests.post(endpoint, headers=headers, json=payload, timeout=20)
    res.raise_for_status()
    return res.json()


def append_to_env(key: str, value: str, env_path: str | Path = ".env") -> None:
    """Append or update a key=value pair in .env."""
    p = Path(env_path)
    lines = p.read_text().splitlines() if p.exists() else []
    found = False
    for i, line in enumerate(lines):
        if line.startswith(f"{key}="):
            lines[i] = f'{key}="{value}"'
            found = True
            break
    if not found:
        lines.append(f'{key}="{value}"')
    p.write_text("\n".join(lines) + "\n")
    os.environ[key] = value
