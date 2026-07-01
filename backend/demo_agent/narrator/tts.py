import edge_tts
import asyncio
import os

async def generate_speech(text: str, output_path: str, voice: str = "en-US-AriaNeural"):
    """
    Generates speech from text using Edge TTS and saves it to the output path.
    """
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_path)

if __name__ == "__main__":
    import sys
    text = "Hello, welcome to this demonstration."
    out = "test_audio.mp3"
    if len(sys.argv) > 2:
        text = sys.argv[1]
        out = sys.argv[2]
    
    asyncio.run(generate_speech(text, out))
    print(f"Saved audio to {out}")
