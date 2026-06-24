from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
import base64
import os
from datetime import datetime
from llm_service import LLMService

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
                    
                    audio_buffer.clear()
                    
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"Doctor Assistant WebSocket Error: {e}")
