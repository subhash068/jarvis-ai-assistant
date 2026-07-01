import logging
import random
from pydantic import BaseModel
from typing import List

logger = logging.getLogger(__name__)

class URLIntelligenceResult(BaseModel):
    status: str
    url: str
    domain: str
    redirects: int
    suspicious_keywords: List[str]
    phishing_indicators: bool
    malware_reports: int
    trust_score: int
    risk_level: str
    recommendation: str

async def analyze_url(url: str) -> URLIntelligenceResult:
    """Analyzes a URL and generates an intelligence report."""
    logger.info(f"Analyzing URL: {url}")
    
    # Simple domain extraction for mock
    domain = url.split("//")[-1].split("/")[0] if "//" in url else url.split("/")[0]
    
    seed = sum(ord(c) for c in url)
    random.seed(seed)
    
    redirects = random.randint(0, 3)
    
    keywords = ["login", "verify", "secure", "update", "account", "bank", "free"]
    num_keywords = random.randint(0, 2)
    found_keywords = random.sample(keywords, num_keywords)
    
    phishing_indicators = num_keywords > 0 and random.choice([True, False])
    malware_reports = random.randint(0, 5) if phishing_indicators else 0
    
    trust_score = 100
    trust_score -= (redirects * 5)
    trust_score -= (num_keywords * 10)
    if phishing_indicators: trust_score -= 40
    trust_score -= (malware_reports * 10)
    
    trust_score = max(0, min(100, trust_score))
    
    if trust_score < 40:
        risk_level = "HIGH RISK"
        recommendation = "Do not click. High probability of phishing or malware."
    elif trust_score < 70:
        risk_level = "MODERATE RISK"
        recommendation = "Exercise caution. Suspicious elements detected."
    else:
        risk_level = "LOW RISK"
        recommendation = "Safe to visit."
        
    return URLIntelligenceResult(
        status="Active",
        url=url,
        domain=domain,
        redirects=redirects,
        suspicious_keywords=found_keywords,
        phishing_indicators=phishing_indicators,
        malware_reports=malware_reports,
        trust_score=trust_score,
        risk_level=risk_level,
        recommendation=recommendation
    )
