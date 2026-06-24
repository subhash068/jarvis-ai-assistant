from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List, Optional
import asyncio

from database import get_db
from services import MessageService, MessageCreate, ThreadService, ThreadCreate

router = APIRouter(
    prefix="/chat",
    tags=["chat"],
)

class ChatRequest(BaseModel):
    user_id: int
    thread_id: Optional[int] = None
    message: str
    web_search: Optional[bool] = False

class ChatResponse(BaseModel):
    role: str
    content: str
    thread_id: int

@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    try:
        # Ensure user exists for testing
        from services import UserService, UserCreate
        user = await UserService.get_user(db, request.user_id)
        if not user:
            await UserService.create_user(db, UserCreate(username="TestUser", email="test@example.com"))

        # If thread_id is None, create a new thread automatically based on the message
        thread_id = request.thread_id
        if not thread_id:
            title = request.message[:30] + "..." if len(request.message) > 30 else request.message
            new_thread = await ThreadService.create_thread(db, ThreadCreate(user_id=request.user_id, title=title))
            thread_id = new_thread.id

        from llm_service import LLMService

        # 1. Save user message to database
        user_msg = MessageCreate(
            user_id=request.user_id,
            thread_id=thread_id,
            role="user",
            content=request.message
        )
        await MessageService.create_message(db, user_msg)
        
        # 2. Fetch conversation history for THIS thread
        from sqlalchemy import select
        from models import Message
        stmt = select(Message).filter(Message.thread_id == thread_id).order_by(Message.created_at.asc())
        res = await db.execute(stmt)
        history_msgs = list(res.scalars().all())
        
        # Format history for LLM
        formatted_history = []
        for msg in history_msgs[:-1]: # exclude the one we just added
            role = "assistant" if msg.role == "ai" else msg.role
            formatted_history.append({"role": role, "content": msg.content})
        
        # 3. Generate real AI response
        ai_text = await LLMService.generate_response(formatted_history, request.message, web_search=request.web_search)
        
        # 4. Save AI response to database
        ai_msg = MessageCreate(
            user_id=request.user_id,
            thread_id=thread_id,
            role="ai",
            content=ai_text
        )
        await MessageService.create_message(db, ai_msg)
        
        return {"role": "ai", "content": ai_text, "thread_id": thread_id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ThreadResponse(BaseModel):
    id: int
    title: str
    created_at: str

@router.get("/threads/{user_id}", response_model=List[ThreadResponse])
async def get_threads(user_id: int, db: AsyncSession = Depends(get_db)):
    threads = await ThreadService.get_user_threads(db, user_id)
    return [
        {
            "id": t.id,
            "title": t.title,
            "created_at": t.created_at.isoformat() if t.created_at else ""
        } for t in threads
    ]

class ThreadMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: str

@router.get("/threads/{thread_id}/messages", response_model=List[ThreadMessageResponse])
async def get_thread_messages(thread_id: int, db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select
    from models import Message
    stmt = select(Message).filter(Message.thread_id == thread_id).order_by(Message.created_at.asc())
    res = await db.execute(stmt)
    messages = list(res.scalars().all())
    
    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "created_at": m.created_at.isoformat() if m.created_at else ""
        } for m in messages
    ]

@router.delete("/threads/{thread_id}")
async def delete_thread(thread_id: int, db: AsyncSession = Depends(get_db)):
    success = await ThreadService.delete_thread(db, thread_id)
    if not success:
        raise HTTPException(status_code=404, detail="Thread not found")
    return {"status": "success"}
