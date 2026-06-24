from typing import TypedDict, List
from langgraph.graph import StateGraph, END
from llm_service import client, MODELS
import json

class AgentState(TypedDict):
    task: str
    plan: str
    steps: List[str]
    current_step: int
    research_results: List[str]
    final_output: str

async def plan_node(state: AgentState) -> dict:
    """Planner Agent: Generates a step-by-step plan to solve the task."""
    task = state["task"]
    prompt = f"""You are the Jarvis Planner Agent. 
Create a detailed step-by-step plan (3 steps maximum) to fulfill the following task: "{task}".
Format the response ONLY as a JSON object with keys:
"plan" (string describing the overall strategy),
"steps" (array of strings representing the individual tasks)."""

    try:
        response = await client.chat.completions.create(
            model=MODELS["reasoning"],
            messages=[
                {"role": "system", "content": "You are a planning coordinator. Respond in raw JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.3
        )
        data = json.loads(response.choices[0].message.content)
        return {
            "plan": data.get("plan", f"Fallback plan for: {task}"),
            "steps": data.get("steps", [f"Search about {task}", f"Synthesize {task}"]),
            "current_step": 0
        }
    except Exception as e:
        print(f"Planner Node Error: {e}")
        return {
            "plan": f"Plan to address: {task}",
            "steps": [f"Research: {task}", "Formulate conclusion"],
            "current_step": 0
        }

async def research_node(state: AgentState) -> dict:
    """Research Agent: Performs investigations/searches for each plan step."""
    steps = state.get("steps", [])
    curr = state.get("current_step", 0)
    
    if curr >= len(steps):
        return {}
        
    step_desc = steps[curr]
    prompt = f"Research step: {step_desc}. Generate a brief summary of facts and information for this step."
    
    try:
        response = await client.chat.completions.create(
            model=MODELS["reasoning"],
            messages=[
                {"role": "system", "content": "You are a research agent. Extract key points briefly."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5
        )
        research_output = response.choices[0].message.content
    except Exception as e:
        research_output = f"Simulated data for step: {step_desc}"
        
    res_list = list(state.get("research_results") or [])
    res_list.append(f"Step {curr+1} ({step_desc}): {research_output}")
    
    return {
        "research_results": res_list,
        "current_step": curr + 1
    }

async def synthesis_node(state: AgentState) -> dict:
    """Final output synthesis combining all research results."""
    task = state["task"]
    research = "\n".join(state.get("research_results") or [])
    prompt = f"""Synthesize a final, direct response to the original task: "{task}" based on the research logs:
{research}"""

    try:
        response = await client.chat.completions.create(
            model=MODELS["reasoning"],
            messages=[
                {"role": "system", "content": "You are the Jarvis master coordinator. Combine findings into a concise, professional answer."},
                {"role": "user", "content": prompt}
            ]
        )
        output = response.choices[0].message.content
    except Exception as e:
        output = f"Synthesized answer based on: {research}"
        
    return {"final_output": output}

def route_next_step(state: AgentState) -> str:
    steps = state.get("steps", [])
    curr = state.get("current_step", 0)
    if curr < len(steps):
        return "research"
    return "synthesize"

# Define the StateGraph workflow
workflow = StateGraph(AgentState)
workflow.add_node("planner", plan_node)
workflow.add_node("research", research_node)
workflow.add_node("synthesize", synthesis_node)

workflow.set_entry_point("planner")
workflow.add_edge("planner", "research")
workflow.add_conditional_edges(
    "research",
    route_next_step,
    {
        "research": "research",
        "synthesize": "synthesize"
    }
)
workflow.add_edge("synthesize", END)

# Compile LangGraph application
agent_graph = workflow.compile()
