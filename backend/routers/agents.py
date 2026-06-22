from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List
from database import get_db
from models import Agent, AgentLog

router = APIRouter(
    prefix="/agents",
    tags=["agents"],
)

class AgentResponse(BaseModel):
    id: int
    name: str
    status: str
    tasks: int
    success_rate: int

    class Config:
        from_attributes = True

class AgentLogResponse(BaseModel):
    id: int
    agent_name: str
    task: str
    time_ago: str
    ok: int

    class Config:
        from_attributes = True

@router.get("/", response_model=List[AgentResponse])
async def get_agents(db: AsyncSession = Depends(get_db)):
    stmt = select(Agent).order_by(Agent.id.asc())
    res = await db.execute(stmt)
    return list(res.scalars().all())

@router.post("/{agent_id}/toggle", response_model=AgentResponse)
async def toggle_agent(agent_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Agent).filter(Agent.id == agent_id)
    res = await db.execute(stmt)
    agent = res.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    if agent.status == "Active":
        agent.status = "Idle"
    else:
        agent.status = "Active"
    
    await db.commit()
    await db.refresh(agent)
    return agent

@router.get("/logs", response_model=List[AgentLogResponse])
async def get_agent_logs(db: AsyncSession = Depends(get_db)):
    stmt = select(AgentLog).order_by(AgentLog.id.desc())
    res = await db.execute(stmt)
    return list(res.scalars().all())
