from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import chromadb
from sqlalchemy import select

from repositories import user_repo, message_repo
from models import User, Message

# Initialize ChromaDB
try:
    chroma_client = chromadb.PersistentClient(path="./.chroma_db")
    collection = chroma_client.get_or_create_collection(name="chat_messages")
    memory_collection = chroma_client.get_or_create_collection(name="user_memories")
except Exception as e:
    print(f"Failed to initialize ChromaDB: {e}")
    collection = None
    memory_collection = None

# Pydantic Schemas
class UserCreate(BaseModel):
    username: str
    email: EmailStr

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    plan: Optional[str] = None
    assistant_voice: Optional[str] = None
    preferred_language: Optional[str] = None
    notifications_enabled: Optional[int] = None
    two_factor_auth: Optional[int] = None
    memory_privacy: Optional[int] = None

class MessageCreate(BaseModel):
    user_id: int
    thread_id: Optional[int] = None
    role: str
    content: str

# Services
class UserService:
    @staticmethod
    async def create_user(db: AsyncSession, user_in: UserCreate) -> User:
        return await user_repo.create(db, user_in)
    
    @staticmethod
    async def get_user(db: AsyncSession, user_id: int) -> Optional[User]:
        return await user_repo.get(db, user_id)
        
    @staticmethod
    async def update_user(db: AsyncSession, user_id: int, user_update: UserUpdate) -> Optional[User]:
        user = await user_repo.get(db, user_id)
        if not user:
            return None
        return await user_repo.update(db, user, user_update)

class MessageService:
    @staticmethod
    async def create_message(db: AsyncSession, message_in: MessageCreate) -> Message:
        db_obj = await message_repo.create(db, message_in)
        
        try:
            # Save to ChromaDB (automatically creates embeddings)
            collection.add(
                ids=[str(db_obj.id)],
                documents=[message_in.content],
                metadatas=[{"role": message_in.role, "user_id": message_in.user_id}]
            )
        except Exception as e:
            print(f"Warning: Failed to add embedding to ChromaDB: {e}")
            
        return db_obj

    @staticmethod
    async def semantic_search(db: AsyncSession, query: str, limit: int = 5) -> List[Message]:
        try:
            results = collection.query(
                query_texts=[query],
                n_results=limit
            )
            
            message_ids = []
            if results and results['ids'] and len(results['ids']) > 0:
                message_ids = [int(id_str) for id_str in results['ids'][0]]
            
            if not message_ids:
                return []
                
            # Fetch from Postgres
            stmt = select(Message).filter(Message.id.in_(message_ids))
            res = await db.execute(stmt)
            return list(res.scalars().all())
        except Exception as e:
            print(f"Search error: {e}")
            return []

from repositories import memory_repo
from models import Memory

class MemoryCreate(BaseModel):
    user_id: int
    category: str
    content: str

class MemoryService:
    @staticmethod
    async def create_memory(db: AsyncSession, memory_in: MemoryCreate) -> Memory:
        new_memory = await memory_repo.create(db, memory_in)
        if memory_collection is not None:
            try:
                memory_collection.add(
                    documents=[memory_in.content],
                    metadatas=[{"category": memory_in.category, "user_id": memory_in.user_id}],
                    ids=[str(new_memory.id)]
                )
            except Exception as e:
                print(f"ChromaDB Memory Indexing Error: {e}")
        return new_memory

    @staticmethod
    async def get_user_memories(db: AsyncSession, user_id: int) -> List[Memory]:
        return await memory_repo.get_by_user(db, user_id)

    @staticmethod
    async def delete_memory(db: AsyncSession, memory_id: int) -> bool:
        obj = await memory_repo.delete(db, memory_id)
        if obj and memory_collection is not None:
            try:
                memory_collection.delete(ids=[str(memory_id)])
            except Exception as e:
                print(f"ChromaDB Memory Delete Error: {e}")
        return obj is not None

    @staticmethod
    async def search_memories(query: str, user_id: int = 1, limit: int = 5) -> List[dict]:
        """Perform semantic search on user memories using ChromaDB."""
        if memory_collection is None:
            return []
        try:
            # query_texts will automatically run local embeddings using default all-MiniLM-L6-v2 ONNX model
            results = memory_collection.query(
                query_texts=[query],
                n_results=limit,
                where={"user_id": user_id}
            )
            retrieved = []
            if results and results["documents"] and len(results["documents"]) > 0:
                for i in range(len(results["documents"][0])):
                    retrieved.append({
                        "id": int(results["ids"][0][i]),
                        "content": results["documents"][0][i],
                        "category": results["metadatas"][0][i].get("category", "General"),
                        "distance": results["distances"][0][i] if "distances" in results else 0.0
                    })
            return retrieved
        except Exception as e:
            print(f"ChromaDB Memory Search Error: {e}")
            return []

from repositories import thread_repo
from models import Thread

class ThreadCreate(BaseModel):
    user_id: int
    title: str

class ThreadService:
    @staticmethod
    async def create_thread(db: AsyncSession, thread_in: ThreadCreate) -> Thread:
        return await thread_repo.create(db, thread_in)

    @staticmethod
    async def get_user_threads(db: AsyncSession, user_id: int) -> List[Thread]:
        return await thread_repo.get_by_user(db, user_id)

    @staticmethod
    async def delete_thread(db: AsyncSession, thread_id: int) -> bool:
        obj = await thread_repo.delete(db, thread_id)
        return obj is not None
