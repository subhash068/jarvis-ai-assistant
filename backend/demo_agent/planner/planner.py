import json
import os
from groq import AsyncGroq
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

# Load env variables from .env
load_dotenv()

class DemoAction(BaseModel):
    action_type: str # 'navigate', 'click', 'fill', 'wait', 'hover', 'scroll'
    selector: Optional[str] = None
    value: Optional[str | int | float] = None
    narration: str # The text to be spoken while or before this action happens

class DemoPlan(BaseModel):
    title: str
    description: str
    actions: List[DemoAction]

async def generate_demo_plan(objective: str, context: str = "") -> DemoPlan:
    """
    Generates a step-by-step browser automation plan and narration script based on the objective.
    """
    api_key = os.environ.get("GroqAPIKey") or os.environ.get("GROQ_API_KEY", "mock-key")
    client = AsyncGroq(api_key=api_key)
    
    prompt = f"""
    You are an AI autonomous demo planning agent.
    Your goal is to plan a product demonstration flow based on the user's objective.
    
    Objective: {objective}
    Additional Context (e.g., page structure): {context}
    
    Create a logical sequence of actions (navigate, click, fill, wait, hover).
    For each action, provide professional narration that explains what is happening or what feature is being showcased.
    
    Return ONLY a structured JSON object with `title`, `description`, and a list of `actions`.
    CRITICAL: Each action object MUST have an `action_type` key (one of 'navigate', 'click', 'fill', 'wait', 'hover', 'scroll'), NOT 'action'. It must also have a `narration` key, and optionally `selector` or `value` keys.
    """
    
    if client.api_key == "mock-key":
        return DemoPlan(
            title="Mock Demo",
            description="A mock demo plan for testing",
            actions=[
                DemoAction(action_type="navigate", value="http://localhost:3000", narration="Welcome to the demo. Let's begin by navigating to the homepage."),
                DemoAction(action_type="wait", value="2000", narration="As you can see, the dashboard loads quickly.")
            ]
        )

    response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "system", "content": prompt}],
        response_format={"type": "json_object"}
    )
    
    content = response.choices[0].message.content
    data = json.loads(content)
    return DemoPlan(**data)

if __name__ == "__main__":
    import asyncio
    async def test():
        plan = await generate_demo_plan("Create a simple login demo for my app.")
        print(plan.model_dump_json(indent=2))
    
    asyncio.run(test())
