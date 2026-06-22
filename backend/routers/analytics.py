from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database import get_db
from models import Message, Memory
from typing import Dict, Any

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
)

@router.get("/{user_id}", response_model=Dict[str, Any])
async def get_analytics(user_id: int, db: AsyncSession = Depends(get_db)):
    # Total messages for this user
    stmt_msgs = select(func.count(Message.id)).filter(Message.user_id == user_id)
    res_msgs = await db.execute(stmt_msgs)
    total_messages = res_msgs.scalar() or 0

    # Total memories for this user
    stmt_mem = select(func.count(Memory.id)).filter(Memory.user_id == user_id)
    res_mem = await db.execute(stmt_mem)
    total_memories = res_mem.scalar() or 0
    
    # Generate mock daily data that isn't fully random, but tied to user ID
    # In a real app we'd group by Date of the messages
    daily = [{"day": str(i+1), "convos": 40 + i*2, "voice": 20 + i} for i in range(14)]
    
    # Mock monthly
    monthly = [{"month": m, "value": 200} for m in ["J","F","M","A","M","J","J","A","S","O","N","D"]]

    # Mock agent mix breakdown
    breakdown = [
        {"name": "Planner", "value": 35},
        {"name": "Research", "value": 25},
        {"name": "Coding", "value": 15},
        {"name": "Productivity", "value": 15},
        {"name": "Automation", "value": 10},
    ]

    return {
        "total_conversations": total_messages,
        "total_memories": total_memories,
        "voice_minutes": 3142, # mock
        "agent_success": "97.6%", # mock
        "daily": daily,
        "monthly": monthly,
        "breakdown": breakdown
    }
