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

# You can change this to "llama-3.3-70b-versatile" for better reasoning
# or "llama-3.1-8b-instant" for absolute lowest latency.
MODEL_NAME = "llama-3.1-8b-instant"

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
                        "enum": ["book_flight", "get_weather", "execute_system_action", "general_chat"],
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
                model=MODEL_NAME,
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
    async def generate_response(conversation_history: list[dict], new_message: str) -> str:
        """
        Acts as the Dialogue Manager. First extracts intent, then routes to appropriate mock tools
        or falls back to general chat.
        """
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
            return AutomationService.execute_app(entities.get("app_or_command", ""))
        else:
            # Step 3: Fallback to General Chat
            messages = [
                {"role": "system", "content": SYSTEM_PROMPT}
            ]
            
            # Add conversation history
            for msg in conversation_history:
                messages.append({"role": msg["role"], "content": msg["content"]})
                
            # Add the new message
            messages.append({"role": "user", "content": new_message})
            
            try:
                response = await client.chat.completions.create(
                    model=MODEL_NAME,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=250
                )
                return response.choices[0].message.content
            except Exception as e:
                print(f"Error calling LLM: {e}")
                return "I'm sorry, my language core is experiencing interference. I couldn't process that request."
