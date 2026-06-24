import asyncio
import websockets
import json

async def test_ws():
    uri = "ws://localhost:8000/vision/stream?source=webcam"
    try:
        async with websockets.connect(uri, additional_headers={"Origin": "http://localhost:5173"}) as websocket:
            print("Connected successfully!")
            message = await websocket.recv()
            print(f"Received: {message[:100]}...")
    except Exception as e:
        print(f"WebSocket error: {e}")

if __name__ == "__main__":
    asyncio.run(test_ws())
