# tools.py (または agent_tools.py)

from langchain_core.tools import tool
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types

# 入力スキーマの定義 (Pydantic)

class InitialShiftGenerationInput(BaseModel):
    requirements: Dict[str, Any] = Field(description="分析されたシフト要件")

class ShiftEvaluationInput(BaseModel):
    shift_data: List[Dict[str, Any]] = Field(description="評価対象のシフトデータ")

class ShiftModificationInput(BaseModel):
    shift_data: List[Dict[str, Any]] = Field(description="修正元のシフトデータ")
    feedback: Dict[str, Any] = Field(description="シフト評価ツールからの改善フィードバック")

class OutputShiftInput(BaseModel):
    shift_data: List[Dict[str, Any]] = Field(description="最終的なシフトデータ")



# ツールを使う際に呼び出すLLMを定義．ここで定義したclientを使い回す．
load_dotenv()
api_key = os.getenv('GEMINI_API')
client = genai.Client(api_key=api_key)

@tool("generate_initial_shift", args_schema=InitialShiftGenerationInput)
def generate_initial_shift_tool(requirements: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    分析された要件に基づいて、最初のバイトシフト案を生成します。
    """
    return generated_shift

@tool("evaluate_shift", args_schema=ShiftEvaluationInput)
def evaluate_shift_tool(shift_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    生成されたシフト案を評価し、スコアと改善点を返します。
    スコアは0から100で、高いほど良いシフト。
    """

    return {"score": max(0, score), "feedback": feedback}

@tool("modify_shift", args_schema=ShiftModificationInput)
def modify_shift_tool(shift_data: List[Dict[str, Any]], feedback: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    評価フィードバックを基にシフトを修正します。
    これはダミーの実装です。実際にはより複雑な修正ロジックを含みます。
    """
    return

@tool("output_shift", args_schema=OutputShiftInput)
def output_shift_tool(shift_data: List[Dict[str, Any]]) -> str:
    """
    最終的なシフトデータをユーザーが読みやすい形式で出力します。
    """
    return

# 全てのツールをリストとしてエクスポート．これをインポートしてツールを使う．
all_tools = [
    analyze_shift_requirements_tool,
    generate_initial_shift_tool,
    evaluate_shift_tool,
    modify_shift_tool,
    output_shift_tool
]
