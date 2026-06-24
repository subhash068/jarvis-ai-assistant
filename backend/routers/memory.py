from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List
from datetime import datetime

from database import get_db
from services import MemoryService, MemoryCreate

router = APIRouter(
    prefix="/memory",
    tags=["memory"],
)

class MemoryResponse(BaseModel):
    id: int
    category: str
    content: str
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[MemoryResponse])
async def get_memories(user_id: int = 1, db: AsyncSession = Depends(get_db)):
    """Fetch all memories for a user."""
    try:
        memories = await MemoryService.get_user_memories(db, user_id)
        return memories
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=MemoryResponse)
async def create_memory(memory: MemoryCreate, db: AsyncSession = Depends(get_db)):
    """Add a new memory."""
    try:
        new_memory = await MemoryService.create_memory(db, memory)
        return new_memory
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{memory_id}")
async def delete_memory(memory_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a memory."""
    try:
        success = await MemoryService.delete_memory(db, memory_id)
        if not success:
            raise HTTPException(status_code=404, detail="Memory not found")
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
