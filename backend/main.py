from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chat, memory, settings, analytics, agents, productivity, research, automation, coding

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
