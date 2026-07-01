from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import asyncio

router = APIRouter(prefix="/crm", tags=["crm"])

class NotionExportRequest(BaseModel):
    id: str
    title: str
    snippet: str
    pitch: str
    url: str
    source: str

@router.post("/export-notion")
async def export_to_notion(req: NotionExportRequest):
    # This is the exact payload structure required by the official Notion API
    # to create a new page in a database.
    notion_payload = {
        "parent": { "database_id": "YOUR_DATABASE_ID_HERE" },
        "properties": {
            "Job Title": {
                "title": [
                    { "text": { "content": req.title } }
                ]
            },
            "Source": {
                "select": { "name": req.source }
            },
            "Status": {
                "status": { "name": "Discovered" }
            },
            "URL": {
                "url": req.url
            },
            "Pitch": {
                "rich_text": [
                    { "text": { "content": req.pitch } }
                ]
            }
        },
        "children": [
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [
                        { "text": { "content": req.snippet } }
                    ]
                }
            }
        ]
    }
    
    print(f"\n--- SYNCING TO NOTION ---")
    print(f"Exporting Lead: {req.title}")
    print(f"Notion Payload:\n{notion_payload}")
    print(f"-------------------------\n")
    
    # Mocking the actual network request
    # TODO: Paste your Notion Secret API Key and replace the database_id above.
    # response = httpx.post(
    #     "https://api.notion.com/v1/pages",
    #     headers={
    #         "Authorization": "Bearer secret_YOUR_NOTION_API_KEY",
    #         "Notion-Version": "2022-06-28",
    #         "Content-Type": "application/json"
    #     },
    #     json=notion_payload
    # )
    
    await asyncio.sleep(1) # Simulate network delay
    
    return {"status": "success", "message": "Lead synced to Notion successfully"}
