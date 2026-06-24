from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List
from database import get_db
from models import Task, Meeting

router = APIRouter(
    prefix="/productivity",
    tags=["productivity"],
)

class TaskResponse(BaseModel):
    id: int
    user_id: int
    text: str
    done: int
    due: str

    class Config:
        from_attributes = True

class TaskCreate(BaseModel):
    user_id: int = 1
    text: str
    due: str = "Today"

class MeetingResponse(BaseModel):
    id: int
    user_id: int
    title: str
    time_span: str
    attendees: str

    class Config:
        from_attributes = True

@router.get("/tasks", response_model=List[TaskResponse])
async def get_tasks(user_id: int = 1, db: AsyncSession = Depends(get_db)):
    stmt = select(Task).filter(Task.user_id == user_id).order_by(Task.id.desc())
    res = await db.execute(stmt)
    return list(res.scalars().all())

@router.post("/tasks", response_model=TaskResponse)
async def create_task(task_in: TaskCreate, db: AsyncSession = Depends(get_db)):
    new_task = Task(user_id=task_in.user_id, text=task_in.text, due=task_in.due, done=0)
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)
    return new_task

@router.put("/tasks/{task_id}/toggle", response_model=TaskResponse)
async def toggle_task(task_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Task).filter(Task.id == task_id)
    res = await db.execute(stmt)
    task = res.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.done = 1 if task.done == 0 else 0
    await db.commit()
    await db.refresh(task)
    return task

@router.delete("/tasks/{task_id}")
async def delete_task(task_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Task).filter(Task.id == task_id)
    res = await db.execute(stmt)
    task = res.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    await db.delete(task)
    await db.commit()
    return {"message": "Task deleted"}


@router.get("/meetings", response_model=List[MeetingResponse])
async def get_meetings(user_id: int = 1, db: AsyncSession = Depends(get_db)):
    stmt = select(Meeting).filter(Meeting.user_id == user_id).order_by(Meeting.id.asc())
    res = await db.execute(stmt)
    return list(res.scalars().all())
