import logging
from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, END
import json

from phone_intelligence_service import analyze_phone_number, PhoneIntelligenceResult
from email_intelligence_service import analyze_email, EmailIntelligenceResult
from domain_intelligence_service import analyze_domain, DomainIntelligenceResult
from ip_intelligence_service import analyze_ip, IPIntelligenceResult
from url_intelligence_service import analyze_url, URLIntelligenceResult
from username_company_service import analyze_username, UsernameIntelligenceResult, analyze_company, CompanyIntelligenceResult
from media_intelligence_service import analyze_document, DocumentIntelligenceResult, analyze_image, ImageIntelligenceResult
from llm_service import client, MODELS # type: ignore

logger = logging.getLogger(__name__)

# State definition
class OSINTState(TypedDict):
    query: str
    target_type: str
    target_value: str
    evidence: Dict[str, Any]
    final_report: str
    threat_score: int
    recommendation: str

async def classify_intent(state: OSINTState):
    """Determine what type of target we are investigating."""
    query = state["query"].strip()
    
    # Simple heuristic classification for the mock
    if "@" in query and "." in query.split("@")[1]:
        state["target_type"] = "email"
        state["target_value"] = query
    elif query.startswith("+") or query.replace("-", "").replace(" ", "").isdigit():
        state["target_type"] = "phone"
        state["target_value"] = query
    elif query.replace(".", "").isdigit() and query.count(".") == 3:
        state["target_type"] = "ip"
        state["target_value"] = query
    elif query.startswith("http"):
        state["target_type"] = "url"
        state["target_value"] = query
    elif "." in query and " " not in query:
        state["target_type"] = "domain"
        state["target_value"] = query
    elif query.endswith(".pdf") or query.endswith(".docx"):
        state["target_type"] = "document"
        state["target_value"] = query
    elif query.endswith(".jpg") or query.endswith(".png"):
        state["target_type"] = "image"
        state["target_value"] = query
    elif len(query.split()) == 1:
        state["target_type"] = "username"
        state["target_value"] = query
    else:
        state["target_type"] = "company"
        state["target_value"] = query
        
    return state

async def collect_evidence(state: OSINTState):
    """Collect evidence based on the target type."""
    t_type = state["target_type"]
    t_val = state["target_value"]
    evidence = {}
    
    if t_type == "phone":
        res = await analyze_phone_number(t_val)
        evidence["phone"] = res.dict()
    elif t_type == "email":
        res = await analyze_email(t_val)
        evidence["email"] = res.dict()
    elif t_type == "domain":
        res = await analyze_domain(t_val)
        evidence["domain"] = res.dict()
    elif t_type == "ip":
        res = await analyze_ip(t_val)
        evidence["ip"] = res.dict()
    elif t_type == "url":
        res = await analyze_url(t_val)
        evidence["url"] = res.dict()
    elif t_type == "username":
        res = await analyze_username(t_val)
        evidence["username"] = res.dict()
    elif t_type == "company":
        res = await analyze_company(t_val)
        evidence["company"] = res.dict()
    elif t_type == "document":
        res = await analyze_document(t_val)
        evidence["document"] = res.dict()
    elif t_type == "image":
        res = await analyze_image(t_val)
        evidence["image"] = res.dict()
        
    state["evidence"] = evidence
    return state

async def generate_report(state: OSINTState):
    """Use the LLM to generate a final report based on the evidence."""
    evidence_json = json.dumps(state["evidence"], indent=2)
    
    prompt = f"""
    You are Jarvis, an expert OSINT investigator.
    I asked you to investigate: {state['query']}
    Target Type determined: {state['target_type']}
    
    Here is the evidence collected from OSINT tools:
    {evidence_json}
    
    Synthesize this into a clear, concise intelligence report.
    Include a threat level, a confidence score, a summary of findings, and a final recommendation.
    Format your response in Markdown. Do not include introductory text, just the report.
    """
    
    try:
        messages = [
            {"role": "system", "content": "You are a professional intelligence analyst."},
            {"role": "user", "content": prompt}
        ]
        
        response = await client.chat.completions.create(
            model=MODELS["fast"],
            messages=messages,
            temperature=0.3,
            max_tokens=500
        )
        
        report_text = response.choices[0].message.content
        state["final_report"] = report_text
        
        # Extract basic metrics from evidence for structured return
        t_type = state["target_type"]
        evidence = state["evidence"].get(t_type, {})
        
        state["threat_score"] = evidence.get("trust_score", 50) # Inverting if necessary, but keep as trust for now
        
        # Calculate a threat score (0-100, where 100 is max threat)
        trust = evidence.get("trust_score", 50)
        state["threat_score"] = 100 - trust
        
        state["recommendation"] = evidence.get("recommendation", "Review the report for details.")
        
    except Exception as e:
        logger.error(f"Error generating LLM OSINT report: {e}")
        state["final_report"] = f"Failed to generate report due to LLM error. Raw evidence: {evidence_json}"
        state["threat_score"] = 50
        state["recommendation"] = "Error"

    return state

# Build the LangGraph
workflow = StateGraph(OSINTState)

workflow.add_node("classify", classify_intent)
workflow.add_node("collect", collect_evidence)
workflow.add_node("report", generate_report)

workflow.set_entry_point("classify")
workflow.add_edge("classify", "collect")
workflow.add_edge("collect", "report")
workflow.add_edge("report", END)

osint_app = workflow.compile()

async def run_investigation(query: str) -> dict:
    initial_state = OSINTState(
        query=query,
        target_type="",
        target_value="",
        evidence={},
        final_report="",
        threat_score=0,
        recommendation=""
    )
    
    # Run the graph
    result = await osint_app.ainvoke(initial_state)
    return result
