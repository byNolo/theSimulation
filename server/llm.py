import os
import requests
import json
import logging

logger = logging.getLogger(__name__)

OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
# Using a cost-effective but capable model
DEFAULT_MODEL = "nex-agi/deepseek-v3.1-nex-n1:free" 

def generate_text(system_prompt: str, user_prompt: str, model: str = DEFAULT_MODEL, temperature: float = 0.7) -> str:
    """
    Generate text using OpenRouter API.
    Returns the content of the response or None if failed.
    """
    if not OPENROUTER_API_KEY:
        logger.warning("OPENROUTER_API_KEY not set. Skipping AI generation.")
        return None

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "X-Title": "The Simulation" # Optional
    }

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": temperature,
        "max_tokens": 1000
    }

    try:
        response = requests.post(OPENROUTER_URL, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()
        
        if 'choices' in data and len(data['choices']) > 0:
            return data['choices'][0]['message']['content']
        else:
            logger.error(f"Invalid response from OpenRouter: {data}")
            return None
            
    except Exception as e:
        logger.error(f"Error calling OpenRouter: {e}")
        return None
