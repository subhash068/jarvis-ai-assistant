from fastapi import APIRouter

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

@router.get("/files")
async def get_files():
    return [
        {"name": "investor-deck.pdf", "size": "4.2 MB", "time": "Today"},
        {"name": "jarvis-architecture.excalidraw", "size": "812 KB", "time": "Today"},
        {"name": "Q3-plan.md", "size": "12 KB", "time": "Yesterday"},
        {"name": "voice-samples.zip", "size": "84 MB", "time": "2d"},
    ]

@router.get("/tasks")
async def get_tasks():
    return [
        {"type": "input", "text": "open spotify"},
        {"type": "output", "text": "→ launched Spotify · focus playlist"},
        {"type": "input", "text": "download invoice_aug.pdf"},
        {"type": "output", "text": "→ saved to ~/Downloads"},
    ]
