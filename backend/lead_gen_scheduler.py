import os
import json
import urllib.request
import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from llm_service import client, MODELS
import uuid

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "data"))
LEADS_FILE = os.path.join(DATA_DIR, "leads.json")

def load_leads():
    if not os.path.exists(LEADS_FILE):
        return []
    try:
        with open(LEADS_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return []

def save_leads(leads):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(LEADS_FILE, "w") as f:
        json.dump(leads, f, indent=2)

async def run_background_scraping():
    print("🤖 [Lead Gen Agent] Running background scan for new leads...")
    
    # We will just scrape r/forhire for "react" or "python" in the background
    keywords = ["react", "python"]
    url = "https://www.reddit.com/r/forhire/new.json?limit=15"
    req_headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) JarvisAI/1.0'}
    
    try:
        request = urllib.request.Request(url, headers=req_headers)
        with urllib.request.urlopen(request) as response:
            data = json.loads(response.read().decode())
    except Exception as e:
        print(f"Failed to fetch background leads: {e}")
        return

    posts = data.get("data", {}).get("children", [])
    
    existing_leads = load_leads()
    existing_urls = {lead["url"] for lead in existing_leads}
    
    new_leads = []
    
    for post in posts:
        post_data = post.get("data", {})
        title = post_data.get("title", "")
        selftext = post_data.get("selftext", "")
        post_url = post_data.get("url", "")
        author = post_data.get("author", "")
        
        # Avoid processing already saved leads
        if post_url in existing_urls:
            continue
            
        combined_text = (title + " " + selftext).lower()
        has_keyword = any(kw in combined_text for kw in keywords)
        
        if has_keyword and "[hiring]" in title.lower():
            prompt = (
                f"You are an AI assistant for a freelance developer. "
                f"Draft a short, compelling pitch (under 100 words) to this potential client. "
                f"Their post title: '{title}'\n"
                f"Their post body: '{selftext[:500]}...'"
            )
            
            try:
                llm_resp = await client.chat.completions.create(
                    model=MODELS["fast"],
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.5,
                    max_tokens=150
                )
                drafted_pitch = llm_resp.choices[0].message.content.strip()
            except Exception as e:
                drafted_pitch = f"Failed to draft pitch: {e}"

            new_leads.append({
                "id": str(uuid.uuid4())[:8],
                "title": title,
                "snippet": selftext[:200] + "..." if len(selftext) > 200 else selftext,
                "url": post_url,
                "author": author,
                "drafted_pitch": drafted_pitch,
                "status": "Drafted (Background)",
                "source": "Reddit (Auto)"
            })
            
    if new_leads:
        print(f"🤖 [Lead Gen Agent] Found {len(new_leads)} new leads!")
        existing_leads.extend(new_leads)
        save_leads(existing_leads)
    else:
        print("🤖 [Lead Gen Agent] Scan complete. No new leads found.")

scheduler = AsyncIOScheduler()

def start_scheduler():
    # Run every 1 minute for demo purposes. (Production: minutes=360)
    scheduler.add_job(run_background_scraping, 'interval', minutes=1)
    scheduler.start()
    print("🤖 [Lead Gen Agent] Background scheduler started (running every 1 minute).")

def stop_scheduler():
    scheduler.shutdown()
