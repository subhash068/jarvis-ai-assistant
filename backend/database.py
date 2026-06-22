import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from dotenv import load_dotenv

load_dotenv()

# We use asyncpg for asynchronous PostgreSQL access
# Replace the prefix postgresql:// with postgresql+asyncpg:// if provided via env var
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql+asyncpg://postgres:manager@localhost:5432/jarvis_ai"
)

# Create the async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=True, # Set to False in production
)

# Create a configured "Session" class
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)

# Base class for SQLAlchemy models
Base = declarative_base()

# Dependency for FastAPI
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
