from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from services import UserService, UserUpdate
from pydantic import BaseModel
from typing import Optional

router = APIRouter(
    prefix="/settings",
    tags=["settings"],
)

class UserSettingsResponse(BaseModel):
    id: int
    username: str
    email: str
    plan: Optional[str] = None
    assistant_voice: Optional[str] = None
    preferred_language: Optional[str] = None
    notifications_enabled: Optional[int] = None
    two_factor_auth: Optional[int] = None
    memory_privacy: Optional[int] = None

@router.get("/{user_id}", response_model=UserSettingsResponse)
async def get_settings(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await UserService.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "plan": user.plan,
        "assistant_voice": user.assistant_voice,
        "preferred_language": user.preferred_language,
        "notifications_enabled": user.notifications_enabled,
        "two_factor_auth": user.two_factor_auth,
        "memory_privacy": user.memory_privacy
    }

@router.put("/{user_id}", response_model=UserSettingsResponse)
async def update_settings(user_id: int, update: UserUpdate, db: AsyncSession = Depends(get_db)):
    updated_user = await UserService.update_user(db, user_id, update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": updated_user.id,
        "username": updated_user.username,
        "email": updated_user.email,
        "plan": updated_user.plan,
        "assistant_voice": updated_user.assistant_voice,
        "preferred_language": updated_user.preferred_language,
        "notifications_enabled": updated_user.notifications_enabled,
        "two_factor_auth": updated_user.two_factor_auth,
        "memory_privacy": updated_user.memory_privacy
    }
