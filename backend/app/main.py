from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from pydantic import BaseModel, Field
from typing import Literal
from pathlib import Path
import sqlite3
import os

app = FastAPI(title="BarkMate AI API", version="0.3.0")
MAX_BYTES = 20 * 1024 * 1024
ALLOWED = {"audio/mp4", "audio/m4a", "audio/mpeg", "audio/wav", "audio/x-wav", "application/octet-stream"}
DB_PATH = Path(os.getenv("BARKMATE_DB_PATH", str(Path(__file__).resolve().parent.parent / "barkmate_feedback.sqlite3")))
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

def init_db():
    with sqlite3.connect(DB_PATH) as db:
        db.execute("""CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dog_name TEXT NOT NULL,
            observed_context TEXT NOT NULL,
            owner_note TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )""")
init_db()

class Feedback(BaseModel):
    dog_name: str = Field(default="My dog", max_length=80)
    observed_context: Literal["doorbell_or_visitor", "play", "left_alone", "outside_sound", "attention", "unknown"]
    owner_note: str | None = Field(default=None, max_length=500)

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "BarkMate AI", "analysis_mode": "demo",
            "feedback_collection": "owner_observed_context_only",
            "feedback_storage": "ephemeral_demo_storage"}

@app.post("/api/audio/analyze")
async def analyze_audio(file: UploadFile = File(...), dog_name: str = Form("My dog"), breed: str = Form("")):
    if file.content_type not in ALLOWED:
        raise HTTPException(status_code=415, detail="Unsupported audio type")
    audio = await file.read()
    if not audio:
        raise HTTPException(status_code=400, detail="Empty audio file")
    if len(audio) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="Audio exceeds 20 MB limit")
    return {
        "dog_name": dog_name, "breed": breed or None,
        "classification": "unknown — demo mode", "possible_emotion": None,
        "confidence": None,
        "explanation": "Audio received. A validated bark-classification model is not connected yet.",
        "recommendation": "Record naturally occurring behaviour and note the situation.",
        "model_version": "demo-0.3.0", "is_demo": True
    }

@app.post("/api/feedback")
def save_feedback(item: Feedback):
    with sqlite3.connect(DB_PATH) as db:
        cur = db.execute(
            "INSERT INTO feedback (dog_name, observed_context, owner_note) VALUES (?, ?, ?)",
            (item.dog_name, item.observed_context, item.owner_note)
        )
        feedback_id = cur.lastrowid
    return {"saved": True, "feedback_id": feedback_id,
            "message": "Owner-observed context saved. This is not a verified emotion label."}
