from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import logging
from osint_orchestrator import run_investigation

router = APIRouter(prefix="/osint", tags=["OSINT"])
logger = logging.getLogger(__name__)

class InvestigationRequest(BaseModel):
    query: str

class InvestigationResponse(BaseModel):
    target_type: str
    target_value: str
    threat_score: int
    recommendation: str
    final_report: str
    evidence: dict

@router.post("/investigate", response_model=InvestigationResponse)
async def investigate_target(request: InvestigationRequest):
    """
    Start an OSINT investigation on a target (phone, email, domain, IP, URL, etc.)
    """
    try:
        result = await run_investigation(request.query)
        
        return InvestigationResponse(
            target_type=result.get("target_type", "unknown"),
            target_value=result.get("target_value", ""),
            threat_score=result.get("threat_score", 0),
            recommendation=result.get("recommendation", ""),
            final_report=result.get("final_report", ""),
            evidence=result.get("evidence", {})
        )
    except Exception as e:
        logger.error(f"Error in OSINT investigation: {e}")
        raise HTTPException(status_code=500, detail=str(e))
