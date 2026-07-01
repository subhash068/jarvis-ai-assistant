from fastapi import APIRouter
from pydantic import BaseModel
from phone_intelligence_service import analyze_phone_number, PhoneAnalysisRequest, PhoneIntelligenceResult

router = APIRouter(prefix="/phone", tags=["Phone Intelligence"])

@router.post("/analyze", response_model=PhoneIntelligenceResult)
async def analyze_phone(request: PhoneAnalysisRequest):
    return await analyze_phone_number(request.phone_number)
