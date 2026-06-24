import io
import edge_tts
from llm_service import client

class VoiceService:
    @staticmethod
    async def transcribe_audio(audio_bytes: bytes, language_code: str = "en-US") -> str:
        """Transcribes audio file bytes using Whisper API."""
        try:
            audio_file = io.BytesIO(audio_bytes)
            audio_file.name = "voice_input.wav"
            
            # Whisper uses ISO-639-1 two letter codes (e.g., 'en', 'hi', 'te')
            iso_lang = language_code.split("-")[0]
            
            response = await client.audio.transcriptions.create(
                model="whisper-large-v3",
                file=audio_file,
                language=iso_lang
            )
            return response.text
        except Exception as e:
            print(f"Whisper Transcription Error: {e}")
            return ""

    @staticmethod
    async def synthesize_speech(text: str, language_code: str = "en-US") -> bytes:
        """Synthesizes text to speech using Edge-TTS neural voices."""
        # Map simple language codes to beautiful neural voices
        voice_map = {
            "en-US": "en-US-AvaNeural",
            "te-IN": "te-IN-ShrutiNeural",
            "hi-IN": "hi-IN-MadhurNeural",
        }
        voice = voice_map.get(language_code, "en-US-AvaNeural")
        
        try:
            communicate = edge_tts.Communicate(text, voice)
            audio_data = b""
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_data += chunk["data"]
            return audio_data
        except Exception as e:
            print(f"Edge-TTS Synthesis Error: {e}")
            return b""
