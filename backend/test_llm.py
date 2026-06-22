import asyncio
from llm_service import LLMService, GROQ_API_KEY

async def test():
    print(f"API Key loaded: {bool(GROQ_API_KEY)}")
    try:
        response = await LLMService.generate_response([{"role": "user", "content": "hi"}], "Open WhatsApp")
        print(f"Response: {response}")
    except Exception as e:
        print(f"Error: {e}")

asyncio.run(test())
