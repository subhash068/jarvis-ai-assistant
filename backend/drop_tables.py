import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv
from models import Base

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

async def drop_all():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        print("Dropping tables defined in models...")
        await conn.run_sync(Base.metadata.drop_all)
        print("Dropping alembic_version table...")
        await conn.execute(text("DROP TABLE IF EXISTS alembic_version;"))
    await engine.dispose()
    print("Database wiped successfully.")

if __name__ == "__main__":
    asyncio.run(drop_all())
