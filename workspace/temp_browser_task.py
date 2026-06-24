from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    page.goto("https://www.youtube.com")
    search_input = page.locator('input[type="search"], input[name="q"], input[name="search"]').first
    search_input.fill("playwright tutorial")
    search_input.press("Enter")
    video_link = page.locator("id=videos > div > a").first
    video_link.click()
    with open('C:/Users/windows-11/Desktop/jarvis-ai-assistant/workspace/task_result.txt', 'w') as f:
        f.write("TASK_COMPLETED: Opened YouTube and played a video")
    page.wait_for_event("close", timeout=0)