import asyncio
import json
from llm_service import LLMService

async def main():
    print("Testing Flight Intent:")
    flight_msg = "Can you book a flight to Paris for tomorrow?"
    res = await LLMService.generate_response([], flight_msg)
    print("Response:", res)
    print("-" * 50)

    print("Testing Weather Intent:")
    weather_msg = "What is the weather like in Tokyo right now?"
    res = await LLMService.generate_response([], weather_msg)
    print("Response:", res)
    print("-" * 50)

    print("Testing General Chat Intent:")
    chat_msg = "Hello Jarvis, how are you doing today?"
    res = await LLMService.generate_response([], chat_msg)
    print("Response:", res)

if __name__ == "__main__":
    asyncio.run(main())
