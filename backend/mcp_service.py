import os
import asyncio
import logging
from mcp.client.stdio import stdio_client, StdioServerParameters
from mcp.client.session import ClientSession

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mcp_service")
logger.setLevel(logging.DEBUG)

import json

class MultiMCPManager:
    def __init__(self):
        self.sessions = {}
        self._server_tasks = {}
        
        self.workspace_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "workspace"))
        os.makedirs(self.workspace_dir, exist_ok=True)
        
        self.config_path = os.path.join(os.path.dirname(__file__), "mcp_config.json")
        self.servers = {}
        self.tool_routing = {}
        self.load_config()

    def load_config(self):
        if not os.path.exists(self.config_path):
            self.servers = {}
            self._configured_envs = {}
            return
            
        with open(self.config_path, "r") as f:
            data = json.load(f)
            
        self.servers.clear()
        self._configured_envs = {}
        for name, params in data.get("servers", {}).items():
            args = params.get("args", [])
            # Replace {WORKSPACE_DIR} placeholder
            args = [a.replace("{WORKSPACE_DIR}", self.workspace_dir) for a in args]
            
            # Handle env variables
            custom_env = params.get("env", {})
            self._configured_envs[name] = custom_env
            
            merged_env = os.environ.copy()
            merged_env.update(custom_env)
            
            self.servers[name] = StdioServerParameters(
                command=params.get("command", "npx.cmd"),
                args=args,
                env=merged_env if custom_env else None
            )

    def save_config(self):
        data = {"servers": {}}
        for name, params in self.servers.items():
            args = []
            for a in params.args:
                if a == self.workspace_dir:
                    args.append("{WORKSPACE_DIR}")
                else:
                    args.append(a)
                    
            data["servers"][name] = {
                "command": params.command,
                "args": args,
                "env": self._configured_envs.get(name, {})
            }
        with open(self.config_path, "w") as f:
            json.dump(data, f, indent=2)

    async def add_server(self, name: str, command: str, args: list, env: dict = None):
        if env is None:
            env = {}
            
        self._configured_envs[name] = env
        merged_env = os.environ.copy()
        merged_env.update(env)
        
        self.servers[name] = StdioServerParameters(
            command=command, 
            args=args,
            env=merged_env if env else None
        )
        self.save_config()
        await self.connect_server(name, self.servers[name])
        await self.get_tools()

    async def connect_server_task(self, name: str, params: StdioServerParameters):
        try:
            logger.info(f"Starting MCP server '{name}'...")
            async with stdio_client(params) as (read_stream, write_stream):
                async with ClientSession(read_stream, write_stream) as session:
                    await session.initialize()
                    self.sessions[name] = session
                    logger.info(f"Connected to '{name}' MCP.")
                    
                    # Keep context open indefinitely until task is cancelled
                    try:
                        while True:
                            await asyncio.sleep(3600)
                    except asyncio.CancelledError:
                        pass
        except Exception as e:
            logger.error(f"Failed to connect to '{name}': {e}")
        finally:
            self.sessions.pop(name, None)

    async def connect_server(self, name: str, params: StdioServerParameters):
        if name in self.sessions or name in self._server_tasks:
            return
            
        task = asyncio.create_task(self.connect_server_task(name, params))
        self._server_tasks[name] = task
        
        # Wait up to 5 seconds for connection to establish
        for _ in range(50):
            if name in self.sessions or task.done():
                break
            await asyncio.sleep(0.1)

    async def connect(self):
        for name, params in self.servers.items():
            await self.connect_server(name, params)

    async def get_tools(self):
        await self.connect()
        all_tools = []
        self.tool_routing.clear()
        
        for server_name, session in list(self.sessions.items()):
            try:
                response = await session.list_tools()
                for t in response.tools:
                    self.tool_routing[t.name] = server_name
                    all_tools.append(t)
            except Exception as e:
                logger.error(f"Failed to list tools for '{server_name}': {e}")
                
        return all_tools

    async def execute_tool(self, name: str, arguments: dict):
        server_name = self.tool_routing.get(name)
        if not server_name:
            await self.get_tools()
            server_name = self.tool_routing.get(name)
            if not server_name:
                return f"Error: Tool '{name}' not found in any connected MCP server."
                
        session = self.sessions.get(server_name)
        if not session:
            return f"Error: Session for server '{server_name}' is not active."
            
        try:
            result = await session.call_tool(name, arguments)
            if hasattr(result, "content") and result.content:
                texts = [c.text for c in result.content if getattr(c, "type", "") == "text"]
                return "\n".join(texts) if texts else str(result.content)
            return str(result)
        except Exception as e:
            logger.error(f"Failed to execute tool {name} on {server_name}: {e}")
            return f"Error executing {name}: {str(e)}"
            
    async def cleanup(self):
        for task in self._server_tasks.values():
            task.cancel()
        self.sessions.clear()
        self._server_tasks.clear()

# Global instance named mcp_client so we don't have to change llm_service.py too much
mcp_client = MultiMCPManager()
