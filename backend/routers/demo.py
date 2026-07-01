from fastapi import APIRouter, BackgroundTasks, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import asyncio
import sys
import threading
import logging
from demo_agent.main import plan_demo, execute_demo
from demo_agent.planner.planner import DemoPlan, DemoAction

router = APIRouter(
    prefix="/demo",
    tags=["Demo Agent"]
)

class PlanRequest(BaseModel):
    objective: str
    target_url: str

class ExecuteRequest(BaseModel):
    plan: dict # Will be converted to DemoPlan
    target_url: str
    voice: Optional[str] = "en-US-AriaNeural"

class DemoResponse(BaseModel):
    message: str
    status: str
    video_path: Optional[str] = None
    youtube_url: Optional[str] = None

def run_async_in_new_thread(coro):
    res = None
    err = None
    
    def worker():
        nonlocal res, err
        if sys.platform == 'win32':
            asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            res = loop.run_until_complete(coro)
        except Exception as e:
            err = e
        finally:
            loop.close()
            
    t = threading.Thread(target=worker)
    t.start()
    t.join()
    if err:
        raise err
    return res

@router.post("/plan", response_model=DemoPlan)
async def generate_plan(request: PlanRequest):
    """
    Analyzes the target URL and generates a DemoPlan containing a script and actions.
    """
    try:
        logging.info(f"Generating plan for {request.target_url} with objective: {request.objective}")
        # Run playwright context extraction in new thread
        plan = run_async_in_new_thread(plan_demo(request.objective, request.target_url))
        return plan
    except Exception as e:
        logging.error(f"Error generating plan: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/execute", response_model=DemoResponse)
async def execute_demo_plan(request: ExecuteRequest):
    """
    Executes a pre-approved DemoPlan.
    """
    try:
        logging.info(f"Executing approved DemoPlan for {request.target_url}")
        
        # Convert dictionary back to Pydantic object
        plan_obj = DemoPlan(**request.plan)
        
        # Run playwright execution in new thread
        result = run_async_in_new_thread(execute_demo(plan_obj, request.target_url, voice=request.voice))
        
        return DemoResponse(
            message="Demo generated successfully!",
            status="success",
            video_path=result.get("video_path"),
            youtube_url=result.get("youtube_url")
        )
    except Exception as e:
        logging.error(f"Error executing demo: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
