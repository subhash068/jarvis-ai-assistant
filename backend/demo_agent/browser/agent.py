import asyncio
import time
import json
from playwright.async_api import async_playwright
from demo_agent.planner.planner import DemoPlan

async def extract_page_context(url: str) -> str:
    """
    Navigates to the given URL and extracts the Accessibility Tree or DOM snippet
    to give the LLM context about what elements exist on the page.
    """
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        try:
            await page.goto(url, wait_until="networkidle")
            # Extracting a simplified accessibility snapshot
            snapshot = await page.accessibility.snapshot()
            # Convert to string, truncate if too large for LLM
            context_str = json.dumps(snapshot, indent=2)
            if len(context_str) > 5000:
                context_str = context_str[:5000] + "\n...[truncated]"
        except Exception as e:
            context_str = f"Failed to extract context: {e}"
        finally:
            await browser.close()
            
    return context_str

async def execute_plan(plan: DemoPlan, initial_url: str = None):
    """
    Executes a given DemoPlan using Playwright and tracks timestamps.
    Returns a timeline of events for video/audio synchronization.
    """
    timeline = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        page = await context.new_page()
        
        start_time = time.time()
        
        if initial_url:
            await page.goto(initial_url)
            await page.wait_for_timeout(2000)
            
        for action in plan.actions:
            action_start = time.time() - start_time
            print(f"Executing: {action.action_type} - {action.narration}")
            
            if action.action_type == "navigate":
                if action.value:
                    await page.goto(action.value)
            elif action.action_type == "click":
                if action.selector:
                    try:
                        await page.click(action.selector, timeout=3000)
                    except Exception as e:
                        print(f"Failed to click {action.selector}: {e}")
            elif action.action_type == "fill":
                if action.selector and action.value:
                    try:
                        await page.fill(action.selector, action.value, timeout=3000)
                    except Exception as e:
                        print(f"Failed to fill {action.selector}: {e}")
            elif action.action_type == "wait":
                if action.value:
                    await page.wait_for_timeout(int(action.value))
            elif action.action_type == "hover":
                if action.selector:
                    try:
                        await page.hover(action.selector, timeout=3000)
                    except Exception as e:
                        print(f"Failed to hover {action.selector}: {e}")
            
            action_end = time.time() - start_time
            
            timeline.append({
                "action": action.action_type,
                "narration": action.narration,
                "start_time": action_start,
                "end_time": action_end
            })
            
            # Add a small buffer between actions
            await page.wait_for_timeout(1500)
            
        await context.close()
        await browser.close()
        
    return timeline

if __name__ == "__main__":
    from demo_agent.planner.planner import DemoAction
    
    mock_plan = DemoPlan(
        title="Google Demo",
        description="Demoing Google Search",
        actions=[
            DemoAction(action_type="navigate", value="https://www.google.com", narration="Let's open Google."),
            DemoAction(action_type="wait", value="2000", narration="Wait for the page to load."),
            DemoAction(action_type="fill", selector="textarea[name='q']", value="Playwright Python", narration="Search for Playwright Python."),
            DemoAction(action_type="click", selector="input[name='btnK']", narration="Click search.")
        ]
    )
    
    timeline = asyncio.run(execute_plan(mock_plan))
    print(json.dumps(timeline, indent=2))
