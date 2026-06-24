# Dynamic MCP Server Configuration

Currently, the UI and backend are hardcoded with three MCP plugins (Filesystem, Persistent Memory, and Sequential Thinking). 
To allow adding new MCP servers dynamically through the UI, we need to build a full-stack dynamic configuration system.

## User Review Required
> [!IMPORTANT]
> This will transition JARVIS from having hardcoded MCP servers to a dynamic configuration file. You'll be able to click "Add Plugin" in the UI, enter an npm package name (e.g., `@modelcontextprotocol/server-sqlite`), and the backend will instantly connect to it. Does this sound like what you are looking for?

## Proposed Changes

### Backend API & Configuration

#### [NEW] [mcp_config.json](file:///c:/Users/windows-11/Desktop/jarvis-ai-assistant/backend/mcp_config.json)
- A local JSON file to store the active MCP servers persistently across reboots.

#### [NEW] [routers/mcp.py](file:///c:/Users/windows-11/Desktop/jarvis-ai-assistant/backend/routers/mcp.py)
- Expose a `GET /mcp` endpoint to retrieve the list of configured MCP servers.
- Expose a `POST /mcp` endpoint to accept a new server configuration (name, npx command arguments) and dynamically connect to it.

#### [MODIFY] [mcp_service.py](file:///c:/Users/windows-11/Desktop/jarvis-ai-assistant/backend/mcp_service.py)
- Refactor `MultiMCPManager` to read its initial servers from `mcp_config.json` rather than a hardcoded dictionary.
- Add an `add_server(name, command, args)` method that updates the JSON file, connects to the new server, and updates the active sessions seamlessly.

#### [MODIFY] [main.py](file:///c:/Users/windows-11/Desktop/jarvis-ai-assistant/backend/main.py)
- Include the new `mcp.router`.

### Frontend UI

#### [MODIFY] [mcp-plugins.tsx](file:///c:/Users/windows-11/Desktop/jarvis-ai-assistant/src/routes/mcp-plugins.tsx)
- Use `@tanstack/react-query` to fetch the active MCP servers from the `GET /mcp` API endpoint instead of hardcoding the cards.
- Add an "Add Plugin" button that opens a simple inline form or dialog.
- The form will take the Plugin Name and npm package name, sending it to `POST /mcp` to dynamically install and connect to the new toolset.

## Verification Plan
### Automated & Manual Verification
- Start the UI and Backend.
- Verify the 3 default plugins load successfully from the API.
- Use the UI to add a test plugin (e.g., `@modelcontextprotocol/server-sqlite` with a test DB path).
- Verify the backend successfully connects and the new card appears in the UI.
