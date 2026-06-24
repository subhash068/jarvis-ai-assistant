from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from mcp_service import mcp_client

router = APIRouter(prefix="/mcp", tags=["MCP Plugins"])

class AddPluginRequest(BaseModel):
    name: str
    command: str
    args: List[str]
    env: Dict[str, str] = {}

@router.get("/")
async def get_plugins():
    await mcp_client.connect()
    plugins = []
    for name, params in mcp_client.servers.items():
        is_connected = name in mcp_client.sessions
        plugins.append({
            "name": name,
            "command": params.command,
            "args": params.args,
            "status": "connected" if is_connected else "disconnected"
        })
    return {"plugins": plugins}

@router.post("/")
async def add_plugin(req: AddPluginRequest):
    try:
        await mcp_client.add_server(req.name, req.command, req.args, req.env)
        return {"status": "success", "message": f"Added and connected to {req.name}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
