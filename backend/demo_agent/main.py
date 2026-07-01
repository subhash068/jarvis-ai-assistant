import asyncio
import os
import json
from demo_agent.planner.planner import generate_demo_plan
from demo_agent.browser.agent import execute_plan, extract_page_context
from demo_agent.narrator.tts import generate_speech
from demo_agent.recorder.screen import ScreenRecorder
from demo_agent.editor.video import VideoEditor
from demo_agent.uploader.youtube import YouTubeUploader
from playwright.async_api import async_playwright

async def plan_demo(objective: str, target_url: str = "https://example.com", status_callback=None):
    async def log_status(step: str, message: str):
        print(f"\n[{step.upper()}] {message}")
        if status_callback:
            if asyncio.iscoroutinefunction(status_callback):
                await status_callback(step, message)
            else:
                status_callback(step, message)

    await log_status("analyzing", f"Analyzing target website: {target_url}...")
    page_context = await extract_page_context(target_url)
    
    await log_status("planning", "Planning Demo Flow based on website structure...")
    plan = await generate_demo_plan(objective, context=page_context)
    await log_status("planning_complete", f"Plan Created: {plan.title}")
    
    return plan

async def execute_demo(plan, target_url: str = "https://example.com", status_callback=None, voice: str = "en-US-AriaNeural"):
    async def log_status(step: str, message: str):
        print(f"\n[{step.upper()}] {message}")
        if status_callback:
            if asyncio.iscoroutinefunction(status_callback):
                await status_callback(step, message)
            else:
                status_callback(step, message)

    # Ensure output directories exist
    os.makedirs("demo_agent/outputs/audio", exist_ok=True)
    os.makedirs("demo_agent/outputs/videos", exist_ok=True)
    
    # 3. Generate Audio
    await log_status("audio", f"Generating Narration Audio using voice: {voice}...")
    for idx, action in enumerate(plan.actions):
        if action.narration:
            audio_path = f"demo_agent/outputs/audio/speech_{idx}.mp3"
            await generate_speech(action.narration, audio_path, voice=voice)
    
    # 4. Start Recording
    await log_status("recording", "Starting Screen Recording...")
    raw_video_path = "demo_agent/outputs/videos/raw_recording.mp4"
    recorder = ScreenRecorder(output_filename=raw_video_path)
    recorder.start()
    
    # 5. Execute Browser Actions
    await log_status("executing", "Executing Browser Automation...")
    timeline = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        page = await context.new_page()
        
        import time
        start_time = time.time()
        
        if target_url:
            await page.goto(target_url)
            await page.wait_for_timeout(2000)
            
        for idx, action in enumerate(plan.actions):
            action_start = time.time() - start_time
            msg = f"Action {idx+1}/{len(plan.actions)}: {action.action_type} - {action.narration}"
            await log_status("executing_action", msg)
            
            if action.action_type == "navigate":
                if action.value:
                    await page.goto(str(action.value))
            elif action.action_type == "click":
                if action.selector:
                    try:
                        await page.click(action.selector, timeout=3000)
                    except Exception as e:
                        await log_status("executing_error", f"Failed to click {action.selector}: {e}")
            elif action.action_type == "fill":
                if action.selector and action.value:
                    try:
                        await page.fill(action.selector, str(action.value), timeout=3000)
                    except Exception as e:
                        await log_status("executing_error", f"Failed to fill {action.selector}: {e}")
            elif action.action_type == "wait":
                if action.value:
                    await page.wait_for_timeout(int(action.value))
            elif action.action_type == "hover":
                if action.selector:
                    try:
                        await page.hover(action.selector, timeout=3000)
                    except Exception as e:
                        await log_status("executing_error", f"Failed to hover {action.selector}: {e}")
            
            action_end = time.time() - start_time
            timeline.append({
                "action": action.action_type,
                "narration": action.narration,
                "start_time": action_start,
                "end_time": action_end
            })
            await page.wait_for_timeout(1500)
            
        await context.close()
        await browser.close()
    
    # Stop Recording
    recorder.stop()
    await log_status("recording_complete", "Recording stopped.")
    
    # Sync Audio to Timeline
    audio_timeline = []
    for idx, event in enumerate(timeline):
        audio_path = f"demo_agent/outputs/audio/speech_{idx}.mp3"
        if os.path.exists(audio_path):
            audio_timeline.append({
                "audio_file": audio_path,
                "start_time": event["start_time"],
                "narration": event["narration"]
            })
    
    # 6. Edit Video
    await log_status("editing", "Editing Final Video...")
    final_video_path = "demo_agent/outputs/videos/final_demo.mp4"
    editor = VideoEditor(raw_video_path, audio_timeline, final_video_path)
    editor.compile_video()
    
    # 7. Upload
    await log_status("uploading", "Publishing to YouTube...")
    uploader = YouTubeUploader()
    metadata = uploader.generate_metadata(plan.title, plan.description)
    upload_result = uploader.upload(final_video_path, metadata)
    
    await log_status("complete", "Demo Generation Complete.")
    return {
        "status": "success",
        "video_path": final_video_path,
        "youtube_url": upload_result if upload_result else None
    }

async def main(objective: str, target_url: str = "https://example.com", status_callback=None):
    plan = await plan_demo(objective, target_url, status_callback)
    return await execute_demo(plan, target_url, status_callback)

if __name__ == "__main__":
    import sys
    objective = "Create demo of my agriculture website."
    target_url = "https://example.com"
    if len(sys.argv) > 1:
        objective = " ".join(sys.argv[1:])
        
    asyncio.run(main(objective, target_url))
