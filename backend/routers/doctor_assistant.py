from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
import base64
import os
from datetime import datetime
from sqlalchemy import select
from llm_service import LLMService
from database import AsyncSessionLocal
from models import Consultation

router = APIRouter(
    prefix="/doctor_assistant",
    tags=["doctor_assistant"],
)

RECORDINGS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "recordings"))
os.makedirs(RECORDINGS_DIR, exist_ok=True)

@router.websocket("/stream")
async def doctor_assistant_stream(websocket: WebSocket):
    await websocket.accept()
    audio_buffer = bytearray()
    language = "en-US"
    
    try:
        await websocket.send_text(json.dumps({
            "type": "status",
            "message": "Connected to Doctor Assistant. Ready to record."
        }))

        while True:
            message = await websocket.receive()
            
            if "bytes" in message:
                audio_buffer.extend(message["bytes"])
                
            elif "text" in message:
                payload = json.loads(message["text"])
                event_type = payload.get("type")
                
                if event_type == "start_stream":
                    audio_buffer.clear()
                    language = payload.get("language", "en-US")
                    await websocket.send_text(json.dumps({
                        "type": "status",
                        "message": "Recording conversation..."
                    }))
                    
                elif event_type == "end_stream":
                    if len(audio_buffer) == 0:
                        await websocket.send_text(json.dumps({
                            "type": "status",
                            "message": "No audio received."
                        }))
                        continue
                    
                    await websocket.send_text(json.dumps({
                        "type": "status",
                        "message": "Saving audio..."
                    }))

                    # Save to file
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    filename = f"consultation_{timestamp}.mp3" # Save as mp3 as requested, though it may be webm bytes natively. Whisper handles it.
                    filepath = os.path.join(RECORDINGS_DIR, filename)
                    
                    with open(filepath, "wb") as f:
                        f.write(bytes(audio_buffer))
                    
                    await websocket.send_text(json.dumps({
                        "type": "status",
                        "message": "Transcribing audio..."
                    }))
                    
                    from voice_service import VoiceService
                    transcription = await VoiceService.transcribe_audio(bytes(audio_buffer), language)
                    
                    if not transcription.strip():
                        await websocket.send_text(json.dumps({
                            "type": "status",
                            "message": "Silence detected."
                        }))
                        audio_buffer.clear()
                        continue
                    
                    await websocket.send_text(json.dumps({
                        "type": "transcription",
                        "text": transcription
                    }))
                    
                    await websocket.send_text(json.dumps({
                        "type": "status",
                        "message": "Summarizing conversation..."
                    }))
                    
                    summary = await LLMService.summarize_medical_conversation(transcription)
                    
                    await websocket.send_text(json.dumps({
                        "type": "summary",
                        "text": summary,
                        "audio_file": filename
                    }))
                    
                    # Save consultation to database
                    async with AsyncSessionLocal() as session:
                        new_consultation = Consultation(
                            user_id=1,  # Hardcoded for now
                            audio_file_path=filename,
                            transcription=transcription,
                            summary=summary
                        )
                        session.add(new_consultation)
                        await session.commit()
                        
                    audio_buffer.clear()
                    
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"Doctor Assistant WebSocket Error: {e}")

@router.get("/consultations")
async def get_consultations(user_id: int = 1):
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(Consultation)
            .where(Consultation.user_id == user_id)
            .order_by(Consultation.created_at.desc())
        )
        consultations = result.scalars().all()
        return [
            {
                "id": c.id,
                "audio_file_path": c.audio_file_path,
                "transcription": c.transcription,
                "summary": c.summary,
                "created_at": c.created_at.isoformat() if c.created_at else None
            }
            for c in consultations
        ]

from pydantic import BaseModel
from fastapi import HTTPException

class VisionAnalysisRequest(BaseModel):
    image_base64: str
    patient_details: dict

@router.post("/analyze_vision")
async def analyze_vision(request: VisionAnalysisRequest):
    try:
        report = await LLMService.analyze_medical_image(request.image_base64, request.patient_details)
        return {"report": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

