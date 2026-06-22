from typing import Generic, TypeVar, Type, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from database import Base

ModelType = TypeVar("ModelType", bound=Base)

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    async def get(self, db: AsyncSession, id: int) -> Optional[ModelType]:
        result = await db.execute(select(self.model).filter(self.model.id == id))
        return result.scalars().first()

    async def get_multi(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[ModelType]:
        result = await db.execute(select(self.model).offset(skip).limit(limit))
        return list(result.scalars().all())

    async def create(self, db: AsyncSession, obj_in: BaseModel) -> ModelType:
        obj_in_data = obj_in.model_dump()
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(self, db: AsyncSession, db_obj: ModelType, obj_in: BaseModel) -> ModelType:
        obj_data = obj_in.model_dump(exclude_unset=True)
        for field in obj_data:
            setattr(db_obj, field, obj_data[field])
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def delete(self, db: AsyncSession, id: int) -> ModelType:
        obj = await self.get(db=db, id=id)
        if obj:
            await db.delete(obj)
            await db.commit()
        return obj

from models import User, Message

class UserRepository(BaseRepository[User]):
    def __init__(self):
        super().__init__(User)

    async def get_by_username(self, db: AsyncSession, username: str) -> Optional[User]:
        result = await db.execute(select(User).filter(User.username == username))
        return result.scalars().first()

class MessageRepository(BaseRepository[Message]):
    def __init__(self):
        super().__init__(Message)

    async def get_similar_messages(self, db: AsyncSession, embedding: list[float], limit: int = 5) -> List[Message]:
        # pgvector search using cosine distance (<=>)
        # Note: Requires creating a vector index (e.g. HNSW) in production for performance
        stmt = select(Message).order_by(Message.embedding.cosine_distance(embedding)).limit(limit)
        result = await db.execute(stmt)
        return list(result.scalars().all())

from models import Memory, Thread

class MemoryRepository(BaseRepository[Memory]):
    def __init__(self):
        super().__init__(Memory)
        
    async def get_by_user(self, db: AsyncSession, user_id: int) -> List[Memory]:
        stmt = select(Memory).filter(Memory.user_id == user_id).order_by(Memory.created_at.desc())
        result = await db.execute(stmt)
        return list(result.scalars().all())

class ThreadRepository(BaseRepository[Thread]):
    def __init__(self):
        super().__init__(Thread)
        
    async def get_by_user(self, db: AsyncSession, user_id: int) -> List[Thread]:
        stmt = select(Thread).filter(Thread.user_id == user_id).order_by(Thread.created_at.desc())
        result = await db.execute(stmt)
        return list(result.scalars().all())

user_repo = UserRepository()
message_repo = MessageRepository()
memory_repo = MemoryRepository()
thread_repo = ThreadRepository()
