import os
import shutil
from datetime import datetime
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pydantic import BaseModel
from automation_service import AutomationService

class AppLaunchRequest(BaseModel):
    app_name: str

class BrowserActionRequest(BaseModel):
    action: str
    query: str = None

class AdvancedBrowserActionRequest(BaseModel):
    instruction: str

router = APIRouter(
    prefix="/automation",
    tags=["automation"],
)

@router.get("/apps")
async def get_apps():
    return ["VS Code", "Notion", "Spotify", "Slack", "Figma", "Chrome", "Terminal", "Calendar"]

@router.get("/browser/actions")
async def get_browser_actions():
    return ["Open new tab", "Search 'edge LLM benchmarks 2025'", "Bookmark current page", "Summarize this article"]

# Global in-memory log of tasks
task_logs = [
    {"type": "input", "text": "system initialized"},
    {"type": "output", "text": "→ Automation engine online and listening."},
]

def add_log(text: str, is_input: bool = False):
    task_logs.append({"type": "input" if is_input else "output", "text": text})
    # Keep only the last 50 logs to prevent memory leak
    if len(task_logs) > 50:
        task_logs.pop(0)

@router.get("/files")
async def get_files():
    workspace_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "workspace")
    if not os.path.exists(workspace_dir):
        os.makedirs(workspace_dir)
    
    file_list = []
    for filename in os.listdir(workspace_dir):
        filepath = os.path.join(workspace_dir, filename)
        if os.path.isfile(filepath):
            stat = os.stat(filepath)
            size_bytes = stat.st_size
            if size_bytes < 1024:
                size_str = f"{size_bytes} B"
            elif size_bytes < 1024 * 1024:
                size_str = f"{size_bytes / 1024:.1f} KB"
            else:
                size_str = f"{size_bytes / (1024 * 1024):.1f} MB"
            
            # Simple date format
            mod_time = datetime.fromtimestamp(stat.st_mtime).strftime("%b %d, %H:%M")
            file_list.append({
                "name": filename,
                "size": size_str,
                "time": mod_time
            })
    return file_list

@router.post("/files")
async def upload_file(file: UploadFile = File(...)):
    try:
        workspace_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "workspace")
        if not os.path.exists(workspace_dir):
            os.makedirs(workspace_dir)
            
        filename = file.filename or "uploaded_file"
        filepath = os.path.join(workspace_dir, os.path.basename(filename))
        
        contents = await file.read()
        with open(filepath, "wb") as buffer:
            buffer.write(contents)
            
        return {"status": "success", "filename": filename}
    except Exception as e:
        print(f"Upload error: {e}")
        return {"status": "error", "message": str(e)}

@router.get("/files/{filename}")
async def download_file(filename: str):
    workspace_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "workspace")
    filepath = os.path.join(workspace_dir, filename)
    if os.path.exists(filepath) and os.path.isfile(filepath):
        return FileResponse(filepath, filename=filename)
    return {"status": "error", "message": "File not found"}

@router.get("/tasks")
async def get_tasks():
    return task_logs

@router.post("/app")
async def launch_app(req: AppLaunchRequest):
    add_log(f"open {req.app_name.lower()}", is_input=True)
    result = AutomationService.execute_app(req.app_name)
    add_log(f"→ {result}")
    return {"status": "success", "message": result}

@router.post("/browser")
async def execute_browser(req: BrowserActionRequest):
    add_log(f"browser {req.action}", is_input=True)
    result = AutomationService.execute_browser_action(req.action, req.query)
    add_log(f"→ {result}")
    return {"status": "success", "message": result}

@router.post("/browser/advanced")
async def execute_advanced_browser(req: AdvancedBrowserActionRequest):
    add_log(f"advanced browser instruction: {req.instruction}", is_input=True)
    result = await AutomationService.execute_advanced_browser_action(req.instruction)
    
    code = ""
    workspace_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "workspace")
    temp_file = os.path.join(workspace_dir, "temp_browser_task.py")
    if os.path.exists(temp_file):
        with open(temp_file, "r", encoding="utf-8") as f:
            code = f.read()
            
    add_log(f"→ {result}")
    return {"status": "success", "message": result, "code": code}

class AdvancedComputerActionRequest(BaseModel):
    instruction: str

@router.post("/pc/advanced")
async def execute_advanced_computer(req: AdvancedComputerActionRequest):
    add_log(f"advanced pc instruction: {req.instruction}", is_input=True)
    result = await AutomationService.execute_advanced_computer_action(req.instruction)
    
    code = ""
    workspace_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "workspace")
    temp_file = os.path.join(workspace_dir, "temp_pc_task.py")
    if os.path.exists(temp_file):
        with open(temp_file, "r", encoding="utf-8") as f:
            code = f.read()
            
    add_log(f"→ {result}")
    return {"status": "success", "message": result, "code": code}
