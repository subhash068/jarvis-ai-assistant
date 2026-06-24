import os
from openai import AsyncOpenAI
from dotenv import load_dotenv

# Load the root .env file using an absolute path based on this file's location
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, "..", ".env")
load_dotenv(dotenv_path=env_path)

GROQ_API_KEY = os.getenv("GroqAPIKey")

if not GROQ_API_KEY:
    print(f"Warning: GroqAPIKey is not set in {env_path}")

# Initialize the OpenAI client pointing to Groq
client = AsyncOpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)

# Configured Models by Capability / Sector (All Free via Groq)
MODELS = {
    "fast": "llama-3.1-8b-instant",               # Routing, intent extraction
    "reasoning": "llama-3.3-70b-versatile",       # General reasoning, logical tasks
    "coding": "llama-3.3-70b-versatile",          # Specialized for code generation
    "deep_thought": "deepseek-r1-distill-llama-70b", # Math, complex logic, deep reasoning
    "creative": "gemma2-9b-it",                   # Creative writing, brainstorming
    "vision": "llama-3.2-11b-vision-preview",     # Image and vision tasks
}

SYSTEM_PROMPT = """You are Jarvis, a highly intelligent, concise, and helpful AI assistant.
Your responses should be brief, direct, and conversational. Do not use overly long paragraphs.
You listen to the user and perform reasoning."""

import json

# Define the tool schema for Intent and Entity Extraction
extraction_tools = [
    {
        "type": "function",
        "function": {
            "name": "extract_intent_and_entities",
            "description": "Extract the intent and entities from the user's message.",
            "parameters": {
                "type": "object",
                "properties": {
                    "intent": {
                        "type": "string",
                        "enum": ["book_flight", "get_weather", "execute_system_action", "automate_browser", "automate_computer", "scrape_website", "general_chat"],
                        "description": "The classified intent of the user's message."
                    },
                    "entities": {
                        "type": "object",
                        "properties": {
                            "destination": {
                                "type": "string",
                                "description": "The destination city for a flight."
                            },
                            "date": {
                                "type": "string",
                                "description": "The date for a flight."
                            },
                            "location": {
                                "type": "string",
                                "description": "The location for checking the weather."
                            },
                            "app_or_command": {
                                "type": "string",
                                "description": "The name of the application or command to execute on the system (e.g., Chrome, Spotify, Notepad)."
                            },
                            "browser_instruction": {
                                "type": "string",
                                "description": "The complex instruction for the browser automation to execute, e.g., 'Go to Google and search for X' or 'Open Amazon and click the first result'."
                            },
                            "computer_instruction": {
                                "type": "string",
                                "description": "The complex instruction for controlling the computer using GUI automation, e.g., 'Open notepad and type hello', 'take a screenshot', 'change volume to 50'."
                            },
                            "url": {
                                "type": "string",
                                "description": "The URL of the website to scrape."
                            }
                        }
                    }
                },
                "required": ["intent", "entities"]
            }
        }
    }
]


def mock_book_flight(destination: str, date: str) -> str:
    if not destination or not date:
        return "I need both a destination and a date to look up flights."
    return f"I have found 3 flights to {destination} for {date}. Shall I book the first one?"

def mock_get_weather(location: str) -> str:
    if not location:
        return "I need a location to check the weather."
    return f"The weather in {location} is currently 72°F and sunny."

class LLMService:
    @staticmethod
    async def _generate_conversational_response(user_message: str, action_result: str, conversation_history: list) -> str:
        prompt = f"The user asked: '{user_message}'. You executed the action and the system returned this result: '{action_result}'. Reply to the user in a natural, conversational way to confirm what you did or explain any errors. Keep it brief and speak directly to the user as their AI assistant."
        messages = [
            {"role": "system", "content": "You are JARVIS, a helpful and conversational AI voice assistant."}
        ]
        for msg in conversation_history:
            messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": prompt})
        
        try:
            response = await client.chat.completions.create(
                model=MODELS["fast"],
                messages=messages,
                temperature=0.7,
                max_tokens=250
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error generating conversational wrapper: {e}")
            return action_result

    @staticmethod
    async def extract_intent_and_entities(new_message: str) -> dict:
        """Forces the LLM to extract intent and entities from the message."""
        messages = [
            {"role": "system", "content": "You are an intent extraction engine. Extract the intent and any relevant entities from the user's message."},
            {"role": "user", "content": new_message}
        ]
        
        try:
            # We use a slightly larger model for better extraction accuracy if needed, 
            # but llama-3.1-8b-instant usually handles basic JSON extraction well.
            response = await client.chat.completions.create(
                model=MODELS["fast"],
                messages=messages,
                tools=extraction_tools,
                tool_choice={"type": "function", "function": {"name": "extract_intent_and_entities"}}
            )
            tool_call = response.choices[0].message.tool_calls[0]
            args = json.loads(tool_call.function.arguments)
            return args
        except Exception as e:
            print(f"Intent Extraction Error: {e}")
            return {"intent": "general_chat", "entities": {}}

    @staticmethod
    async def generate_response(conversation_history: list[dict], new_message: str, web_search: bool = False) -> str:
        """
        Acts as the Dialogue Manager. First extracts intent, then routes to appropriate mock tools
        or falls back to general chat.
        """
        if web_search:
            from search_service import SearchService
            search_context = await SearchService.search_and_scrape(new_message)
            
            prompt = f"Answer the user's query: '{new_message}' based on the following web search and scraped website contents:\n\n{search_context}"
            messages = [
                {"role": "system", "content": "You are JARVIS. Answer the user's query by summarizing, comparing, and synthesizing details from the provided search results. Provide clean, well-structured markdown answers."},
                {"role": "user", "content": prompt}
            ]
            try:
                response = await client.chat.completions.create(
                    model=MODELS["reasoning"],
                    messages=messages,
                    temperature=0.4
                )
                return response.choices[0].message.content
            except Exception as e:
                print(f"Error answering search query: {e}")
                return f"I performed a web search but could not process the findings: {str(e)}"

        # Step 1: Extract intent and entities
        extraction = await LLMService.extract_intent_and_entities(new_message)
        intent = extraction.get("intent", "general_chat")
        entities = extraction.get("entities", {})
        
        print(f"Detected Intent: {intent}, Entities: {entities}")

        # Step 2: Dialogue Management Routing
        if intent == "book_flight":
            return mock_book_flight(entities.get("destination"), entities.get("date"))
        elif intent == "get_weather":
            return mock_get_weather(entities.get("location"))
        elif intent == "execute_system_action":
            from automation_service import AutomationService
            result = AutomationService.execute_app(entities.get("app_or_command", ""))
            return await LLMService._generate_conversational_response(new_message, result, conversation_history)
        elif intent == "automate_browser":
            from automation_service import AutomationService
            result = await AutomationService.execute_advanced_browser_action(
                instruction=entities.get("browser_instruction", new_message)
            )
            return await LLMService._generate_conversational_response(new_message, result, conversation_history)
        elif intent == "automate_computer":
            from automation_service import AutomationService
            result = await AutomationService.execute_advanced_computer_action(
                instruction=entities.get("computer_instruction", new_message)
            )
            return await LLMService._generate_conversational_response(new_message, result, conversation_history)
        elif intent == "scrape_website":
            url = entities.get("url")
            if not url:
                import re
                urls = re.findall(r'(https?://\S+)', new_message)
                url = urls[0] if urls else None
                
            if not url:
                return "Please provide a valid website URL to scrape."
                
            from scraper_service import ScraperService
            scraped_content = await ScraperService.scrape_url(url)
            
            prompt = f"Answer the user's query: '{new_message}' based on the text scraped from the website {url}:\n\n{scraped_content}"
            messages = [
                {"role": "system", "content": "You are a website content analyzer. Summarize or answer questions based on the provided webpage content concisely."},
                {"role": "user", "content": prompt}
            ]
            try:
                response = await client.chat.completions.create(
                    model=MODELS["reasoning"],
                    messages=messages,
                    temperature=0.3
                )
                return response.choices[0].message.content
            except Exception as e:
                print(f"Error analyzing scraped page: {e}")
                return f"Successfully scraped the page but failed to analyze it: {str(e)}"
        else:
            # Step 3: Fallback to General Chat
            try:
                from services import MemoryService
                memories = await MemoryService.search_memories(new_message, user_id=1, limit=3)
                if memories:
                    mem_context = "\n".join([f"- [{m['category']}] {m['content']}" for m in memories])
                    sys_prompt = SYSTEM_PROMPT + f"\n\nRelevant user history and memories:\n{mem_context}"
                else:
                    sys_prompt = SYSTEM_PROMPT
            except Exception as e:
                print(f"Memory context injection error: {e}")
                sys_prompt = SYSTEM_PROMPT

            messages = [
                {"role": "system", "content": sys_prompt}
            ]
            
            # Add conversation history
            for msg in conversation_history:
                messages.append({"role": msg["role"], "content": msg["content"]})
                
            # Add the new message
            messages.append({"role": "user", "content": new_message})
            
            try:
                from mcp_service import mcp_client
                mcp_tools_raw = await mcp_client.get_tools()
                mcp_openai_tools = []
                for t in mcp_tools_raw:
                    mcp_openai_tools.append({
                        "type": "function",
                        "function": {
                            "name": t.name,
                            "description": t.description or "",
                            "parameters": t.inputSchema or {}
                        }
                    })

                kwargs = {
                    "model": MODELS["reasoning"],
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 1024
                }
                
                if mcp_openai_tools:
                    kwargs["tools"] = mcp_openai_tools
                    kwargs["tool_choice"] = "auto"
                
                try:
                    response = await client.chat.completions.create(**kwargs)
                except Exception as api_err:
                    print(f"API error with tools (likely formatting 400): {api_err}")
                    if "tools" in kwargs:
                        del kwargs["tools"]
                        del kwargs["tool_choice"]
                        response = await client.chat.completions.create(**kwargs)
                    else:
                        raise api_err
                
                response_message = response.choices[0].message
                
                if response_message.tool_calls:
                    # Append the assistant's tool call message
                    tool_calls_data = []
                    for tc in response_message.tool_calls:
                        tool_calls_data.append({
                            "id": tc.id,
                            "type": "function",
                            "function": {
                                "name": tc.function.name,
                                "arguments": tc.function.arguments
                            }
                        })
                    
                    messages.append({
                        "role": "assistant",
                        "content": response_message.content,
                        "tool_calls": tool_calls_data
                    })

                    for tool_call in response_message.tool_calls:
                        name = tool_call.function.name
                        try:
                            args = json.loads(tool_call.function.arguments)
                        except:
                            args = {}
                        print(f"Executing MCP Tool: {name} with args {args}")
                        try:
                            tool_result = await mcp_client.execute_tool(name, args)
                        except Exception as tool_err:
                            print(f"MCP Tool execution failed: {tool_err}")
                            tool_result = f"Error executing tool: {tool_err}"
                        
                        messages.append({
                            "role": "tool",
                            "name": name,
                            "tool_call_id": tool_call.id,
                            "content": str(tool_result)
                        })
                    
                    final_response = await client.chat.completions.create(
                        model=MODELS["reasoning"],
                        messages=messages,
                        temperature=0.7,
                        max_tokens=1024
                    )
                    return final_response.choices[0].message.content
                else:
                    return response_message.content
                
            except Exception as e:
                print(f"Error calling LLM: {e}")
                return "I'm sorry, my language core is experiencing interference. I couldn't process that request."

    @staticmethod
    async def generate_coding_snippet(tool_name: str, prompt: str) -> dict:
        """Generates dynamic code snippets based on the chosen tool and user prompt."""
        messages = [
            {"role": "system", "content": "You are a senior pair programmer AI. Given a tool name and user prompt, output ONLY a raw JSON object with the following strictly required keys:\n- 'title' (string): A short title for the snippet.\n- 'language' (string): The programming language.\n- 'code' (string): The full, working code snippet (do not use markdown formatting inside the string, just raw code).\n- 'explanation' (array of strings): 3-5 short bullet points explaining the code."},
            {"role": "user", "content": f"Tool: {tool_name}\nPrompt: {prompt}\n\nPlease generate the JSON object now. Ensure the 'code' key contains the actual implementation."}
        ]
        try:
            response = await client.chat.completions.create(
                model=MODELS["coding"],
                messages=messages,
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=3000
            )
            data = json.loads(response.choices[0].message.content)
            # Ensure safe fallback for missing keys
            return {
                "title": data.get("title", "Generated Code"),
                "language": data.get("language", "Text"),
                "code": data.get("code", "// Code generation failed. Please try again with a more specific prompt.") or "// Code returned empty.",
                "explanation": data.get("explanation", ["No explanation provided."])
            }
        except Exception as e:
            print(f"Coding generation error: {e}")
            return {
                "title": "Error Generating Code",
                "language": "Text",
                "code": f"An error occurred: {str(e)}",
                "explanation": ["Failed to connect to the AI coding engine."]
            }

    @staticmethod
    async def generate_playwright_test(prompt: str, url: str) -> str:
        messages = [
            {"role": "system", "content": "You are a senior QA automation engineer. Generate a valid, complete Playwright test script in TypeScript based on the user's prompt. Do not use markdown wrappers in your final output, just raw code. Do not include ```typescript or ``` tags. Start directly with import { test, expect } from '@playwright/test';"},
            {"role": "user", "content": f"URL: {url}\nPrompt: {prompt}\n\nPlease generate the raw TypeScript code for this Playwright test."}
        ]
        try:
            response = await client.chat.completions.create(
                model=MODELS["reasoning"],
                messages=messages,
                temperature=0.2,
                max_tokens=3000
            )
            code = response.choices[0].message.content.strip()
            # Failsafe stripping of markdown blocks just in case
            if code.startswith("```"):
                lines = code.split("\n")
                if len(lines) > 2:
                    code = "\n".join(lines[1:-1])
            return code
        except Exception as e:
            print(f"Playwright generation error: {e}")
            return f"// Failed to generate test: {str(e)}"

    @staticmethod
    async def summarize_medical_conversation(transcription: str) -> str:
        messages = [
            {"role": "system", "content": "You are a professional medical assistant. Analyze the following transcript of a doctor-patient conversation and provide a concise medical summary. Include Chief Complaint, History of Present Illness, Assessment, and Plan if applicable."},
            {"role": "user", "content": f"Transcript:\n{transcription}\n\nPlease generate the summary."}
        ]
        try:
            response = await client.chat.completions.create(
                model=MODELS["reasoning"],
                messages=messages,
                temperature=0.3,
                max_tokens=1500
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Summarization error: {e}")
            return f"Failed to generate summary: {str(e)}"

