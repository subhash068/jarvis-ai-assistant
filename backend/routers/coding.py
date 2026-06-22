from fastapi import APIRouter

router = APIRouter(
    prefix="/coding",
    tags=["coding"],
)

@router.get("/tools")
async def get_tools():
    return [
        {"name": "Code Generator", "icon": "Code2", "desc": "Spin up files, components and APIs from a prompt."},
        {"name": "Bug Analyzer", "icon": "Bug", "desc": "Paste a stack trace, get a root-cause and a fix."},
        {"name": "Code Reviewer", "icon": "ClipboardList", "desc": "Senior-level PR review in seconds."},
        {"name": "API Builder", "icon": "Server", "desc": "Design REST/GraphQL endpoints with types."},
        {"name": "Database Designer", "icon": "Database", "desc": "Sketch a schema in plain English."},
    ]

@router.get("/snippet")
async def get_snippet():
    return {
        "title": "Generated · jarvis-voice.py",
        "language": "Python · FastAPI",
        "code": "// FastAPI · WebSocket transcript stream\n@app.websocket(\"/voice\")\nasync def voice(ws: WebSocket):\n    await ws.accept()\n    async for chunk in mic_stream(ws):\n        text = await whisper.transcribe(chunk)\n        reply = await gpt.chat(text, memory=user.memory)\n        await tts.stream(reply, ws)",
        "explanation": [
            "Accepts a WebSocket and streams audio chunks from the mic.",
            "Each chunk goes through Whisper for transcription.",
            "GPT receives the transcript plus user memory and produces a reply.",
            "ElevenLabs streams the spoken response back through the socket."
        ]
    }
