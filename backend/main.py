import sys
import os

# Add the local virtual environment site-packages to sys.path 
# so the IDE and interpreter can correctly resolve ML dependencies like ultralytics.
venv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'venv', 'Lib', 'site-packages'))
if venv_path not in sys.path:
    sys.path.insert(0, venv_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chat, memory, settings, analytics, agents, productivity, research, automation, coding, vision, voice, testing, mcp

app = FastAPI(
    title="Jarvis AI Assistant API",
    description="Backend API for the Jarvis AI Assistant",
    version="0.1.0",
)

app.include_router(chat.router)
app.include_router(memory.router)
app.include_router(settings.router)
app.include_router(analytics.router)
app.include_router(agents.router)
app.include_router(productivity.router)
app.include_router(research.router)
app.include_router(automation.router)
app.include_router(coding.router)
app.include_router(vision.router)
app.include_router(voice.router)
app.include_router(testing.router)
app.include_router(mcp.router)

from fastapi.staticfiles import StaticFiles
playwright_report_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "playwright-engine", "playwright-report"))
os.makedirs(playwright_report_dir, exist_ok=True)
app.mount("/testing/report", StaticFiles(directory=playwright_report_dir, html=True), name="playwright-report")


# Configure CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8080", "http://localhost:8081"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Jarvis API is running"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
