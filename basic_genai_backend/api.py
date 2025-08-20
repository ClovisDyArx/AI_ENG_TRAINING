# --- imports --- 
import os
from dotenv import load_dotenv

import requests
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from typing import List

# --- huggingface --- 
load_dotenv()

HF_API_TOKEN = os.getenv("HF_API_TOKEN")
HF_API_URL = "https://router.huggingface.co/v1/chat/completions"
TEXT_GENERATION_MODEL = "deepseek-ai/DeepSeek-R1:novita"

if not HF_API_TOKEN:
    raise ValueError('HF_API_TOKEN not found in .env file.')

headers = {
    "Authorization": f"Bearer {HF_API_TOKEN}",
}
# --- fastapi --- 

app = FastAPI(
    title="GenAI Backend API",
    description="Backend for the Next.js, AI app.",
    version="1.0.0",
)

# --- cors (middleware) ---
origins = [
    "http://localhost:3000", # next.js
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic formatting ---

class TextPayload(BaseModel):
    prompt: str
    

def query_hf_api(payload: dict):
    try:
        response = requests.post(HF_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=69, detail=f"Error querying HF : {e}")


# --- api ---

@app.get("/")
async def home() -> dict:
    return {"message" : "Hello World !"}


@app.post("/api/v1/generate")
def generate_answer(payload : TextPayload):
    api_payload = {
        "messages": [
            {
                "role": "user",
                "content": f"{payload.prompt}"
            }
        ],
        "model": TEXT_GENERATION_MODEL
    }
    response = query_hf_api(payload=api_payload)
    try:
        generated_text = response["choices"][0]["message"]
        return {"generated_text": generated_text}
    except (IndexError, KeyError, TypeError) as e:
        raise HTTPException(status_code=420, detail=f"API error : {e}")
