import os
import json
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from typing import Dict
from langchain_google_genai.chat_models import ChatGoogleGenerativeAI
from langchain.chat_models import init_chat_model
from langchain.tools import tool

# --- Pydantic Models ---
class Shift(BaseModel):
    """Represents a single shift with a day, start time, and finish time."""
    shift_id: int = Field(..., description="The unique identifier for the shift.")
    day: str = Field(..., description="The date of the shift in YYYY-MM-DD format.")
    start: str = Field(..., description="The start time of the shift in HH:MM format.")
    finish: str = Field(..., description="The finish time of the shift in HH:MM format.")

class ProposedShift(BaseModel):
    """Represents a newly proposed shift for a specific worker."""
    worker_name: str = Field(..., description="The name of the worker for whom the shift is proposed.")
    shift: Shift = Field(..., description="The details of the proposed shift.")

# --- LLM and Environment Setup ---
load_dotenv()

if os.getenv('GOOGLE_API_KEY'):
  os.environ["GOOGLE_API_KEY"] = os.getenv('GOOGLE_API_KEY')
else:
  print("Google API key not found.")

# llm = ChatGoogleGenerativeAI(
#     model="gemini-2.0-flash",
#     temperature=0,
#     max_tokens=None,
#     timeout=30,
#     max_retries=2,
# )
llm = init_chat_model(
    model="gemini-2.5-flash",
    model_provider='google_genai',
    temperature=0,
    max_retries=2
)

# --- LLM-based Tool Helper ---
def call_gemini_model(system_instruction: str, user_content: str) -> str:
    """Calls the Gemini model with a system instruction and user content."""
    messages = [
        ("system", system_instruction),
        ("human", user_content)
    ]
    print(f"ヘルパー関数が呼び出されました．\n{messages}")
    response = llm.invoke(messages)
    print(f"llmをinvokeします．")
    return response.content

# --- New Shift Creation Tool ---

@tool
def create_shift_draft_tool(full_json_input: str) -> str:
    """
    Creates a draft for a new shift based on a comprehensive JSON input.
    This tool analyzes the full company and worker data to propose a new shift,
    prioritizing the worker's requested shifts.

    Args:
        full_json_input: A string containing the full JSON data with company info,
                        worker details, and constraints.

    Returns:
        A JSON string representing the newly created draft shift for one worker.
    """
    system_instruction = """You are an expert shift creator. Your task is to create a single new shift draft based on the provided JSON data.
    The JSON contains all company information, a list of all workers with their details, their existing shift requests, and overall constraints.

    Your primary goal is to satisfy the workers' shift requests as much as possible. The input contains the shifts they have *already requested*.
    You must analyze the input and infer which single shift should be created next. Often, this means creating a shift for a worker who has requested one but it has not been formalized yet, or fulfilling a specific need based on the constraints (like ensuring a rookie is covered).

    Based on all the provided information, propose ONE new shift for ONE worker.

    Output only the JSON for the newly created shift. Do not include any other text, explanations, or markdown formatting.
    The output format must be a JSON object with 'worker_name' and 'shift' keys.
    Example Output:
    { "worker_name": "高橋 康成", "shift": { "shift_id": 9001, "day": "2025-07-25", "start": "10:00", "finish": "18:00" } }
    """
    user_content = full_json_input
    print(f"ユーザーコンテントが定義されました．\n{user_content}")
    return call_gemini_model(system_instruction, user_content)
