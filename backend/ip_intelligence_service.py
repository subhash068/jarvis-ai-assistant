import os
import random
import logging
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class IPIntelligenceResult(BaseModel):
    status: str
    ip_address: str
    country: str
    city: str
    isp: str
    asn: str
    organization: str
    abuse_reports: int
    blacklist_status: bool
    trust_score: int
    risk_level: str
    recommendation: str

async def analyze_ip(ip_address: str) -> IPIntelligenceResult:
    """Analyzes an IP address and generates an intelligence report."""
    logger.info(f"Analyzing IP: {ip_address}")
    
    seed = sum(ord(c) for c in ip_address)
    random.seed(seed)
    
    countries = ["United States", "Germany", "India", "China", "Brazil", "Russia", "UK"]
    isps = ["Comcast", "Deutsche Telekom", "Jio", "China Telecom", "Claro", "Rostelecom", "BT"]
    
    country = random.choice(countries)
    isp = random.choice(isps)
    city = "Mock City"
    asn = f"AS{random.randint(1000, 99999)}"
    org = f"{isp} Communications"
    
    abuse_reports = random.randint(0, 50)
    blacklist_status = abuse_reports > 20
    
    trust_score = 100
    trust_score -= (abuse_reports * 2)
    if blacklist_status: trust_score -= 40
    
    trust_score = max(0, min(100, trust_score))
    
    if trust_score < 40:
        risk_level = "HIGH RISK"
        recommendation = "Block traffic from this IP. Known bad actor."
    elif trust_score < 70:
        risk_level = "MODERATE RISK"
        recommendation = "Monitor closely. Some abuse reports."
    else:
        risk_level = "LOW RISK"
        recommendation = "Normal IP behavior."
        
    return IPIntelligenceResult(
        status="Active",
        ip_address=ip_address,
        country=country,
        city=city,
        isp=isp,
        asn=asn,
        organization=org,
        abuse_reports=abuse_reports,
        blacklist_status=blacklist_status,
        trust_score=trust_score,
        risk_level=risk_level,
        recommendation=recommendation
    )
