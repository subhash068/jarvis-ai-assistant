import asyncio
from database import AsyncSessionLocal
from sqlalchemy import text

async def main():
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("UPDATE users SET plan = 'Premium plan' WHERE plan IS NULL"))
            await session.execute(text("UPDATE users SET assistant_voice = 'Aurora · 1.0x speed' WHERE assistant_voice IS NULL"))
            await session.execute(text("UPDATE users SET preferred_language = 'English (US) · auto-switch to Telugu / Hindi' WHERE preferred_language IS NULL"))
            await session.execute(text("UPDATE users SET notifications_enabled = 1 WHERE notifications_enabled IS NULL"))
            await session.execute(text("UPDATE users SET two_factor_auth = 1 WHERE two_factor_auth IS NULL"))
            await session.execute(text("UPDATE users SET memory_privacy = 1 WHERE memory_privacy IS NULL"))
            await session.commit()
            print("Successfully updated NULL fields.")
    except Exception as e:
        print(f"Database error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
