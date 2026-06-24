from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List
from database import get_db
from models import ResearchReport, ResearchFinding
from llm_service import client, MODELS
from search_service import SearchService

router = APIRouter(
    prefix="/research",
    tags=["research"],
)

class ReportResponse(BaseModel):
    id: int
    user_id: int
    title: str
    sources_count: int
    content: str

    class Config:
        from_attributes = True

class GenerateRequest(BaseModel):
    topic: str
    user_id: int = 1

class FindingResponse(BaseModel):
    id: int
    user_id: int
    text: str

    class Config:
        from_attributes = True

@router.get("/reports", response_model=List[ReportResponse])
async def get_reports(user_id: int = 1, db: AsyncSession = Depends(get_db)):
    stmt = select(ResearchReport).filter(ResearchReport.user_id == user_id).order_by(ResearchReport.id.desc())
    res = await db.execute(stmt)
    return list(res.scalars().all())

@router.get("/findings", response_model=List[FindingResponse])
async def get_findings(user_id: int = 1, db: AsyncSession = Depends(get_db)):
    stmt = select(ResearchFinding).filter(ResearchFinding.user_id == user_id).order_by(ResearchFinding.id.desc())
    res = await db.execute(stmt)
    return list(res.scalars().all())

@router.post("/generate", response_model=ReportResponse)
async def generate_report(req: GenerateRequest, db: AsyncSession = Depends(get_db)):
    try:
        # Perform real web search to gather context
        context = await SearchService.search_and_scrape(req.topic, limit=4)
        
        # Calculate actual sources count
        sources = context.count("--- URL SOURCE:") if context else 0
        if sources == 0:
            sources = 1 # Fallback so it doesn't show 0 if it relied on generic LLM knowledge
            
        # Prompt LLM to write a research report about the topic using context
        system_prompt = (
            "You are a Senior Research Analyst. Write a detailed, professional research report "
            "summarizing key trends, numbers, and references based on the provided Web Search Context. "
            "Be informative, structured, and cite sources where possible."
        )
        user_prompt = f"Topic: {req.topic}\n\nWeb Search Context:\n{context}\n\nCreate a comprehensive research report on this topic."
        
        response = await client.chat.completions.create(
            model=MODELS["reasoning"],
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=800
        )
        report_content = response.choices[0].message.content or "No content generated."
        
        # Create a new report entry in DB

        new_report = ResearchReport(
            user_id=req.user_id,
            title=req.topic,
            sources_count=sources,
            content=report_content
        )
        db.add(new_report)
        
        # Generate and save a key finding from this report
        finding_prompt = f"Based on this research report, extract exactly one short key finding bullet point (max 15 words):\n{report_content}"
        finding_res = await client.chat.completions.create(
            model=MODELS["reasoning"],
            messages=[{"role": "user", "content": finding_prompt}],
            temperature=0.5,
            max_tokens=40
        )
        finding_text = finding_res.choices[0].message.content or "New key trend identified."
        finding_text = finding_text.strip().strip("-").strip("•").strip()
        
        new_finding = ResearchFinding(
            user_id=req.user_id,
            text=finding_text
        )
        db.add(new_finding)
        
        await db.commit()
        await db.refresh(new_report)
        return new_report
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
