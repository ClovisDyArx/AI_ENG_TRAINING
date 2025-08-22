import os
from dotenv import load_dotenv

import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import uvicorn

from pydantic import BaseModel

load_dotenv()

# SPECIFICATIONS :
"""
This code defines a single API endpoint /api/v1/polish.
It will take a JSON object with the description
and the desired tone, construct a specific prompt
for the LLM, and send back the result.
"""

# 1 - Setup env
HF_API_TOKEN = os.getenv('HF_API_TOKEN')
HF_API_URL = "https://router.huggingface.co/v1/chat/completions"
HF_MODEL_NAME = "openai/gpt-oss-20b:fireworks-ai"

if not HF_API_TOKEN :
    raise ValueError("No Huggingface api token (make sure to create a Personnal Access Token, and login into your HF's account)")

headers = {
    "Authorization": f"Bearer {HF_API_TOKEN}",
}

# 2 - FastAPI
app = FastAPI(
    title="AI Job polisher",
    description="Polishes job descriptions.",
    version="0.0.1"
)


# 3 - CORS
origins = [
    "http://localhost:3000", # front-end Next.JS
    "http://localhost:8000", # back-end Python
    # "http://localhost"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4 - Pydantic
class QueryPayload(BaseModel):
    job_description: str
    desired_tone: str


def query_payload(payload: dict):
    try:
        response = requests.post(url=HF_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()
    
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=1, detail=f"Something went wrong during when querying the HuggingFace's model : {e}")


def format_prompt(q_payload : QueryPayload) -> str:
    return f"""
            You are an expert at polishing job description.
            You role is to polish any job description, according to a specific tone.
            
            example :
            job_description : You will be an employee at the Michelin's tire factory.
            desired_tone : uplifting
            
            polished job description : You will have the immense pleasure to be part of Michelin's flagship tire's factory.
            
            Now, here is the job description you need to polish :
            {q_payload.job_description}
            \n
            And here is the desired tone :
            {q_payload.desired_tone}
            """


# 5 - API
@app.get("/")
async def home():
    return {"message" : "Hello World !"}


@app.post("/api/v1/polish")
def polish_endpoint(q_payload : QueryPayload):
    payload = {
        "messages": [
            {
                "role": "user",
                "content": format_prompt(q_payload=q_payload)
            }
        ],
        "model": HF_MODEL_NAME
    }
    response = query_payload(payload=payload)
    try:
        message = response["choices"][0]["message"]
        return {"polished_job" : message}
    except Exception as e:
        raise HTTPException(status_code=2, detail=f"Something went wrong during when querying our endpoint : {e}")


# 6 - Main
if __name__ == "__main__":
    uvicorn.run("backend:app", host="127.0.0.1", port=8000, reload=True)