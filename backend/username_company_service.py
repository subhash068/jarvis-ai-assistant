import logging
import random
from pydantic import BaseModel
from typing import List

logger = logging.getLogger(__name__)

class PlatformMatch(BaseModel):
    platform: str
    url: str
    exists: bool

class UsernameIntelligenceResult(BaseModel):
    username: str
    platforms_found: List[PlatformMatch]
    likely_profession: str
    confidence: int

class CompanyIntelligenceResult(BaseModel):
    company_name: str
    website: str
    employee_estimate: str
    technologies: List[str]
    headquarters: str

async def analyze_username(username: str) -> UsernameIntelligenceResult:
    logger.info(f"Analyzing username: {username}")
    
    platforms = ["GitHub", "X", "Reddit", "LinkedIn", "Medium", "Stack Overflow", "Dev.to"]
    seed = sum(ord(c) for c in username)
    random.seed(seed)
    
    matches = []
    for p in platforms:
        exists = random.choice([True, False, False]) # 33% chance to exist
        matches.append(PlatformMatch(
            platform=p,
            url=f"https://{p.lower().replace(' ', '')}.com/{username}" if exists else "",
            exists=exists
        ))
    
    found_count = sum(1 for m in matches if m.exists)
    is_dev = any(m.platform in ["GitHub", "Stack Overflow", "Dev.to"] and m.exists for m in matches)
    
    professions = ["Software Developer", "Designer", "Marketer", "Unknown"]
    profession = "Software Developer" if is_dev else random.choice(professions)
    
    confidence = min(99, 40 + (found_count * 15)) if found_count > 0 else 10
    
    return UsernameIntelligenceResult(
        username=username,
        platforms_found=matches,
        likely_profession=profession,
        confidence=confidence
    )

async def analyze_company(company_name: str) -> CompanyIntelligenceResult:
    logger.info(f"Analyzing company: {company_name}")
    
    techs = ["React", "Python", "AWS", "Node.js", "Docker", "Kubernetes", "Next.js", "PostgreSQL"]
    seed = sum(ord(c) for c in company_name)
    random.seed(seed)
    
    return CompanyIntelligenceResult(
        company_name=company_name,
        website=f"https://www.{company_name.lower().replace(' ', '')}.com",
        employee_estimate=random.choice(["1-10", "11-50", "51-200", "201-500", "500+"]),
        technologies=random.sample(techs, random.randint(2, 6)),
        headquarters=random.choice(["San Francisco, CA", "New York, NY", "London, UK", "Berlin, DE", "Bangalore, IN", "Remote"])
    )
