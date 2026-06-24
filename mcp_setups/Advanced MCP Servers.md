# Integrate Advanced MCP Servers

The goal is to add the most advanced Model Context Protocol (MCP) servers to the JARVIS backend. We will integrate two highly advanced official MCP servers:
1. **Memory Server (`@modelcontextprotocol/server-memory`)**: This provides a persistent knowledge graph memory system, allowing JARVIS to remember facts, entities, and preferences across sessions.
2. **Sequential Thinking Server (`@modelcontextprotocol/server-sequential-thinking`)**: This provides a framework for dynamic, step-by-step reasoning, allowing JARVIS to solve complex problems methodically.

## User Review Required
> [!IMPORTANT]
> This requires a significant refactor of `mcp_service.py` to support connecting to and multiplexing tools across **multiple** MCP servers simultaneously. Node.js/npx is required to launch these servers, which should already be installed on your system.

## Proposed Changes

### MCP Manager Component

#### [MODIFY] [mcp_service.py](file:///c:/Users/windows-11/Desktop/jarvis-ai-assistant/backend/mcp_service.py)
- Refactor the `LocalMCPClient` to `MultiMCPManager` which will hold a dictionary of active sessions.
- Initialize the following servers:
  - `filesystem`: pointing to the workspace.
  - `memory`: for knowledge graph storage.
  - `sequential-thinking`: for complex reasoning.
- Update `get_tools()` to aggregate tools from all connected servers.
- Update `execute_tool(name, arguments)` to route the tool call to the specific server that registered it.

### LLM Dialogue Manager

#### [MODIFY] [llm_service.py](file:///c:/Users/windows-11/Desktop/jarvis-ai-assistant/backend/llm_service.py)
- Update the global instance from `mcp_client = LocalMCPClient()` to `mcp_manager = MultiMCPManager()`.
- Update the dialogue routing block (around line 250) to use `mcp_manager` to fetch all tools and execute them correctly.

## Verification Plan
### Automated & Manual Verification
- Start the FastAPI backend and ensure no startup errors occur while spawning multiple `npx` subprocesses.
- Test chatting with JARVIS and asking it to "remember that my favorite color is blue" to verify the Memory MCP tools are called.
- Check the console logs to see the tool executions.
