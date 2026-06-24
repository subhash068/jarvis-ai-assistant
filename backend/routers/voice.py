from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
import base64
from llm_service import LLMService

router = APIRouter(
    prefix="/voice",
    tags=["voice"],
)

@router.websocket("/stream")
async def voice_stream(websocket: WebSocket):
    await websocket.accept()
    audio_buffer = bytearray()
    language = "en-US"
    
    try:
        # Welcome message
        await websocket.send_text(json.dumps({
            "type": "status",
            "message": "Connected to JARVIS voice processor."
        }))

        while True:
            # Check for either binary bytes or text events
            message = await websocket.receive()
            
            if "bytes" in message:
                # Accumulate raw audio chunks
                audio_buffer.extend(message["bytes"])
                
            elif "text" in message:
                payload = json.loads(message["text"])
                event_type = payload.get("type")
                
                if event_type == "start_stream":
                    audio_buffer.clear()
                    language = payload.get("language", "en-US")
                    await websocket.send_text(json.dumps({
                        "type": "status",
                        "message": "Listening..."
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
                        "message": "Transcribing..."
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
                    
                    # Send transcription to client
                    await websocket.send_text(json.dumps({
                        "type": "transcription",
                        "text": transcription
                    }))
                    
                    # Generate dialogue response
                    await websocket.send_text(json.dumps({
                        "type": "status",
                        "message": "Thinking..."
                    }))
                    ai_response = await LLMService.generate_response(conversation_history=[], new_message=transcription)
                    
                    # Generate speech output
                    await websocket.send_text(json.dumps({
                        "type": "status",
                        "message": "Synthesizing voice..."
                    }))
                    audio_response = await VoiceService.synthesize_speech(ai_response, language)
                    
                    audio_base64 = base64.b64encode(audio_response).decode("utf-8")
                    
                    # Send response back with audio payload
                    await websocket.send_text(json.dumps({
                        "type": "speech_response",
                        "text": ai_response,
                        "audio": audio_base64
                    }))
                    
                    audio_buffer.clear()
                    
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"Voice WebSocket Error: {e}")
