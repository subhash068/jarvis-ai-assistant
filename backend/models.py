from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    plan = Column(String(20), default="Free plan")
    assistant_voice = Column(String(50), default="Aurora · 1.0x speed")
    preferred_language = Column(String(50), default="English (US) · auto-switch to Telugu / Hindi")
    notifications_enabled = Column(Integer, default=1) # 1 for True, 0 for False, SQLite-friendly boolean alternative
    two_factor_auth = Column(Integer, default=1)
    memory_privacy = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    messages = relationship("Message", back_populates="user")
    threads = relationship("Thread", back_populates="user")

class Thread(Base):
    __tablename__ = "threads"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="threads")
    messages = relationship("Message", back_populates="thread")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    thread_id = Column(Integer, ForeignKey("threads.id"), nullable=True) # Nullable for older messages
    role = Column(String(20), nullable=False) # e.g., 'user', 'assistant', 'system'
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="messages")
    thread = relationship("Thread", back_populates="messages")

class Memory(Base):
    __tablename__ = "memories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String(50), nullable=False)
    key = Column(String(100), nullable=False)
    value = Column(Text, nullable=False)
    importance = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User")

class EpisodicMemory(Base):
    __tablename__ = "episodic_memories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    time = Column(DateTime(timezone=True), server_default=func.now())
    importance = Column(Integer, default=1)
    tags = Column(String(200), nullable=True) # Comma-separated tags

    user = relationship("User")

class SkillMemory(Base):
    __tablename__ = "skill_memories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_category = Column(String(100), nullable=False) # e.g., 'Preferred backend'
    preference = Column(String(100), nullable=False) # e.g., 'Go'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User")

class ToolMemory(Base):
    __tablename__ = "tool_memories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    tool_name = Column(String(100), nullable=False)
    configuration = Column(Text, nullable=False) # JSON or descriptive string
    status = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User")

class ProjectMemory(Base):
    __tablename__ = "project_memories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_name = Column(String(100), nullable=False)
    files = Column(Text, nullable=True) # Comma separated or JSON
    tasks = Column(Text, nullable=True)
    architecture = Column(Text, nullable=True)
    goals = Column(Text, nullable=True)
    deadlines = Column(String(200), nullable=True)
    tech_stack = Column(String(200), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User")

class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    status = Column(String(20), default="Idle") # e.g. Active, Idle, Standby
    tasks = Column(Integer, default=0)
    success_rate = Column(Integer, default=95)

class AgentLog(Base):
    __tablename__ = "agent_logs"

    id = Column(Integer, primary_key=True, index=True)
    agent_name = Column(String(50), nullable=False)
    task = Column(String(200), nullable=False)
    time_ago = Column(String(50), nullable=False)
    ok = Column(Integer, default=1) # 1 for Success, 0 for Failed

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    text = Column(String(200), nullable=False)
    done = Column(Integer, default=0) # 0 for False, 1 for True
    due = Column(String(50), nullable=False)

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    time_span = Column(String(100), nullable=False) # e.g. "10:00 — 10:30"
    attendees = Column(String(200), nullable=False) # comma-separated list of names

class ResearchReport(Base):
    __tablename__ = "research_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    sources_count = Column(Integer, default=0)
    content = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ResearchFinding(Base):
    __tablename__ = "research_findings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    text = Column(String(500), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserFile(Base):
    __tablename__ = "user_files"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    size = Column(String(50), nullable=False)
    time_ago = Column(String(50), nullable=False)

class ConsoleLog(Base):
    __tablename__ = "console_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    command = Column(String(500), nullable=False)
    output = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    audio_file_path = Column(String(500), nullable=True)
    transcription = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
