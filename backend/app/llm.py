import os, json
import httpx

LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_API_BASE = os.getenv("LLM_API_BASE", "https://api.openai.com/v1")
LLM_MODEL = os.getenv("LLM_MODEL", "")

PROMPT = """You are a trading assistant. Given metrics + headlines for a stock pick, write:
- 3 concise bullets explaining why it ranked highly (use the metrics explicitly)
- 1 concise risk note
Return STRICT JSON:
{
  "bullets": ["...", "...", "..."],
  "risk": "..."
}
No extra keys, no markdown.
"""

async def explain_pick(payload: dict) -> dict:
    if not LLM_API_KEY or not LLM_MODEL:
        # graceful fallback: no LLM configured
        return {"bullets": [], "risk": ""}

    url = f"{LLM_API_BASE.rstrip('/')}/chat/completions"
    headers = {"Authorization": f"Bearer {LLM_API_KEY}", "Content-Type": "application/json"}

    body = {
        "model": LLM_MODEL,
        "temperature": 0.2,
        "messages": [
            {"role": "system", "content": PROMPT},
            {"role": "user", "content": json.dumps(payload)}
        ]
    }

    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(url, headers=headers, json=body)
        r.raise_for_status()
        text = r.json()["choices"][0]["message"]["content"]
        return json.loads(text)

