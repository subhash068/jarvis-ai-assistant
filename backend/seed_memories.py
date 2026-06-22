import asyncio
from database import engine, Base, AsyncSessionLocal
from models import Memory, User, Thread, Agent, AgentLog, Task, Meeting, ResearchReport, ResearchFinding, UserFile, ConsoleLog
from sqlalchemy import text

async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as db:
        # Create user
        try:
            await db.execute(text("INSERT INTO users (id, username, email, plan) VALUES (1, 'Jordan Reyes', 'jordan@jarvis.ai', 'Premium plan') ON CONFLICT DO NOTHING"))
            await db.commit()
        except:
            pass 

        # Insert some memories
        memories = [
            Memory(user_id=1, category="Preferences", content="Prefers concise replies, formal but warm tone"),
            Memory(user_id=1, category="Personal", content="Lives in Hyderabad; commutes by metro"),
            Memory(user_id=1, category="Projects", content="Building JARVIS AI — launch targeted for Q3"),
            Memory(user_id=1, category="Knowledge", content="Has read Designing Data-Intensive Applications cover to cover")
        ]
        db.add_all(memories)
        
        # Insert threads
        threads = [
            Thread(user_id=1, title="Roadmap brainstorm"),
            Thread(user_id=1, title="Apartment search Hyderabad")
        ]
        db.add_all(threads)

        # Insert Agents
        agents = [
            Agent(name="Planner", status="Active", tasks=12, success_rate=98),
            Agent(name="Research", status="Active", tasks=7, success_rate=94),
            Agent(name="Coding", status="Idle", tasks=3, success_rate=96),
            Agent(name="Productivity", status="Active", tasks=21, success_rate=99),
            Agent(name="Automation", status="Standby", tasks=5, success_rate=91),
        ]
        db.add_all(agents)

        # Insert AgentLogs
        logs = [
            AgentLog(agent_name="Planner", task="Built weekly plan", time_ago="2m", ok=1),
            AgentLog(agent_name="Research", task="Summarized 8 sources on edge AI", time_ago="12m", ok=1),
            AgentLog(agent_name="Coding", task="Generated FastAPI scaffold", time_ago="1h", ok=1),
            AgentLog(agent_name="Automation", task="Opened Notion + arranged windows", time_ago="3h", ok=0),
        ]
        db.add_all(logs)

        # Insert Tasks
        tasks = [
            Task(user_id=1, text="Finalize JARVIS launch one-pager", done=0, due="Today 5pm"),
            Task(user_id=1, text="Review investor deck v3", done=0, due="Tomorrow"),
            Task(user_id=1, text="Ship voice latency fix", done=1, due="Yesterday"),
            Task(user_id=1, text="Book flights to Bengaluru", done=0, due="Fri"),
        ]
        db.add_all(tasks)

        # Insert Meetings
        meetings = [
            Meeting(user_id=1, title="Design sync", time_span="10:00 — 10:30", attendees="Priya, Arjun"),
            Meeting(user_id=1, title="Investor call", time_span="13:00 — 13:45", attendees="Sequoia"),
            Meeting(user_id=1, title="Deep work", time_span="15:00 — 17:00", attendees="Solo"),
        ]
        db.add_all(meetings)

        # Insert Research Reports
        reports = [
            ResearchReport(user_id=1, title="State of small language models in 2026", sources_count=14, content="State of small language models in 2026 content..."),
            ResearchReport(user_id=1, title="Voice agent latency benchmarks", sources_count=9, content="Voice agent latency benchmarks content..."),
            ResearchReport(user_id=1, title="ElevenLabs vs Cartesia TTS comparison", sources_count=7, content="ElevenLabs vs Cartesia TTS comparison content..."),
            ResearchReport(user_id=1, title="Enterprise memory architectures", sources_count=11, content="Enterprise memory architectures content..."),
        ]
        db.add_all(reports)

        # Insert Research Findings
        findings = [
            ResearchFinding(user_id=1, text="Whisper-large v3 is 38% faster on Apple Silicon than v2."),
            ResearchFinding(user_id=1, text="Median voice-to-voice latency target: <800ms end-to-end."),
            ResearchFinding(user_id=1, text="pgvector + HNSW outperforms IVF for <1M embeddings."),
            ResearchFinding(user_id=1, text="Telugu ASR benefits from phoneme-level finetuning."),
        ]
        db.add_all(findings)

        # Insert UserFiles
        user_files = [
            UserFile(user_id=1, name="investor-deck.pdf", size="4.2 MB", time_ago="Today"),
            UserFile(user_id=1, name="jarvis-architecture.excalidraw", size="812 KB", time_ago="Today"),
            UserFile(user_id=1, name="Q3-plan.md", size="12 KB", time_ago="Yesterday"),
            UserFile(user_id=1, name="voice-samples.zip", size="84 MB", time_ago="2d"),
        ]
        db.add_all(user_files)

        # Insert ConsoleLogs
        console_logs = [
            ConsoleLog(user_id=1, command="open spotify", output="→ launched Spotify · focus playlist"),
            ConsoleLog(user_id=1, command="download invoice_aug.pdf", output="→ saved to ~/Downloads"),
        ]
        db.add_all(console_logs)
        
        await db.commit()
        print("Seeded database with Phase 1, 2 & 3 models.")

if __name__ == "__main__":
    asyncio.run(main())

