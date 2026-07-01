from fastapi import APIRouter, HTTPException
import urllib.request
import json
from pydantic import BaseModel
from typing import Optional
from llm_service import client, MODELS
from scraper_service import ScraperService
import os
import uuid

router = APIRouter(prefix="/lead-gen", tags=["lead-gen"])

class ScrapeRequest(BaseModel):
    mode: str = "reddit" # 'reddit' or 'url'
    subreddit: Optional[str] = "forhire"
    keyword: Optional[str] = "react"
    url: Optional[str] = None

class CallRequest(BaseModel):
    phone_number: str
    lead_title: str
    lead_snippet: str
    pitch: str

class EmailRequest(BaseModel):
    recipient_email: str
    subject: str
    body: str
    lead_id: str

@router.get("/leads")
async def get_saved_leads():
    from lead_gen_scheduler import load_leads
    return {"leads": load_leads()}

@router.post("/scrape")
async def scrape_leads(req: ScrapeRequest):
    leads = []

    if req.mode == "reddit":
        url = f"https://www.reddit.com/r/{req.subreddit}/new.json?limit=25"
        req_headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) JarvisAI/1.0'}
        
        try:
            request = urllib.request.Request(url, headers=req_headers)
            with urllib.request.urlopen(request) as response:
                data = json.loads(response.read().decode())
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch from Reddit: {str(e)}")

        posts = data.get("data", {}).get("children", [])
        
        for post in posts:
            post_data = post.get("data", {})
            title = post_data.get("title", "")
            selftext = post_data.get("selftext", "")
            post_url = post_data.get("url", "")
            author = post_data.get("author", "")
            
            if req.keyword and (req.keyword.lower() in title.lower() or req.keyword.lower() in selftext.lower()):
                if "[hiring]" in title.lower():
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

                    leads.append({
                        "id": post_data.get("id"),
                        "title": title,
                        "snippet": selftext[:200] + "..." if len(selftext) > 200 else selftext,
                        "url": post_url,
                        "author": author,
                        "drafted_pitch": drafted_pitch,
                        "status": "Drafted",
                        "source": "Reddit"
                    })

    elif req.mode == "url" and req.url:
        try:
            # 1. Scrape the raw text from the URL
            scraped_text = await ScraperService.scrape_url(req.url)
            
            # 2. Use LLM to extract job postings and draft pitches
            extraction_prompt = (
                f"You are an expert Lead Generation AI. Read the following scraped webpage text. "
                f"Identify any freelance or job opportunities that might be relevant. "
                f"For each opportunity you find, generate a JSON object with 'title' (the job title or summary), "
                f"'snippet' (a short quote or description of the job), and 'pitch' (a short 100-word pitch offering services). "
                f"Return ONLY a JSON array of these objects. "
                f"If you find none, return an empty array [].\n\n"
                f"Website Text:\n{scraped_text[:5000]}" # Limit to 5000 chars to avoid token limits
            )
            
            llm_resp = await client.chat.completions.create(
                model=MODELS["reasoning"],
                messages=[{"role": "user", "content": extraction_prompt}],
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=2000
            )
            
            content = llm_resp.choices[0].message.content.strip()
            
            # Handle potential markdown wrapping of JSON
            if content.startswith("```json"):
                content = content.replace("```json\n", "").replace("\n```", "")
            
            parsed = json.loads(content)
            
            # If the LLM returned a dict with a key holding the array (e.g., {"jobs": [...]}), handle that
            jobs = parsed if isinstance(parsed, list) else list(parsed.values())[0] if isinstance(parsed, dict) and len(parsed) > 0 else []
            
            import uuid
            for job in jobs:
                leads.append({
                    "id": str(uuid.uuid4())[:8],
                    "title": job.get("title", "Found Opportunity"),
                    "snippet": job.get("snippet", "No description provided.")[:200],
                    "url": req.url,
                    "author": "Website",
                    "drafted_pitch": job.get("pitch", "Could not draft pitch."),
                    "status": "Drafted",
                    "source": "Web Scraper"
                })
                
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to scrape or process URL: {str(e)}")

    return {"leads": leads}

@router.post("/call")
async def initiate_call(req: CallRequest):
    import asyncio
    
    # 1. Construct the System Prompt for the Voice Agent
    system_prompt = (
        f"You are an AI Sales Development Representative. You are calling a prospect "
        f"about their recent job post: '{req.lead_title}'.\n"
        f"Here is what they are looking for: '{req.lead_snippet}'.\n\n"
        f"Your goal is to pitch our services using this drafted pitch:\n"
        f"'{req.pitch}'\n\n"
        f"Be conversational, polite, and act like a human. Wait for them to say hello first."
    )
    
    print(f"\n--- INITIATING AI PHONE CALL ---")
    print(f"To: {req.phone_number}")
    print(f"System Prompt Payload:\n{system_prompt}")
    print(f"--------------------------------\n")
    
    # 2. Mock API Call to Telephony Provider (e.g., Bland AI)
    await asyncio.sleep(2) # Simulate network delay
    
    # 3. For the demo, we will generate an MP3 recording of what the AI *would* say
    # so the user can listen to it.
    call_id = str(uuid.uuid4())
    recording_filename = f"{call_id}.mp3"
    
    # Text to synthesize (just the pitch to simulate the conversation)
    simulated_speech = f"Hi, I'm calling about your post: {req.lead_title}. {req.pitch}"
    
    try:
        from voice_service import VoiceService
        audio_bytes = await VoiceService.synthesize_speech(simulated_speech, language_code="en-US")
        
        # Save to static/recordings
        recordings_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "static", "recordings"))
        os.makedirs(recordings_dir, exist_ok=True)
        file_path = os.path.join(recordings_dir, recording_filename)
        
        with open(file_path, "wb") as f:
            f.write(audio_bytes)
            
        recording_url = f"/static/recordings/{recording_filename}"
    except Exception as e:
        print(f"Failed to generate mock recording: {e}")
        recording_url = None
    
    return {
        "status": "success",
        "message": f"AI Voice Agent has dialed {req.phone_number}.",
        "call_id": call_id,
        "recording_url": recording_url
    }

@router.post("/send-email")
async def send_outreach_email(req: EmailRequest):
    import asyncio
    from datetime import datetime, timedelta
    
    print(f"\n--- INITIATING AI EMAIL OUTREACH ---")
    print(f"To: {req.recipient_email}")
    print(f"Subject: {req.subject}")
    print(f"Body:\n{req.body}")
    print(f"------------------------------------\n")
    
    # 1. Mock SMTP Call
    # TODO: Paste your SMTP Configuration here:
    # import smtplib
    # from email.mime.text import MIMEText
    # msg = MIMEText(req.body)
    # msg['Subject'] = req.subject
    # msg['From'] = "youremail@gmail.com"
    # msg['To'] = req.recipient_email
    # with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp_server:
    #    smtp_server.login("youremail@gmail.com", "YOUR_APP_PASSWORD")
    #    smtp_server.sendmail("youremail@gmail.com", req.recipient_email, msg.as_string())
    
    await asyncio.sleep(1) # Simulate network delay
    
    # 2. Schedule Follow-up
    try:
        from lead_gen_scheduler import scheduler
        
        # Mock follow-up function
        def send_followup_email(email: str, original_subject: str):
            print(f"\n[AUTO-FOLLOWUP] Checking if {email} replied...")
            print(f"[AUTO-FOLLOWUP] No reply detected. Sending follow-up to {email} for '{original_subject}'.\n")
            
        run_date = datetime.now() + timedelta(days=3)
        
        # For testing purposes, we'll actually schedule it for 2 minutes from now, but print 3 days
        demo_run_date = datetime.now() + timedelta(minutes=2)
        
        scheduler.add_job(
            send_followup_email, 
            'date', 
            run_date=demo_run_date, 
            args=[req.recipient_email, req.subject]
        )
        print(f"🤖 Scheduled automatic follow-up for {req.recipient_email} in 3 days (simulated as 2 minutes).")
    except Exception as e:
        print(f"Failed to schedule follow-up: {e}")

    return {
        "status": "success",
        "message": f"Pitch successfully sent to {req.recipient_email}."
    }
