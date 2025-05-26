import requests
from app.config import GROQ_API_KEY

GROQ_MODEL = "llama3-8b-8192"


def generate_with_groq(prompt: str) -> str:
    """
    Generate a response from the Groq LLM API using the provided prompt.

    Args:
        prompt (str): The prompt or question to send to the LLM.

    Returns:
        str: The generated answer from the LLM.
    """
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2
    }

    response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers=headers,
        json=payload
    )

    return response.json()["choices"][0]["message"]["content"]
