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
class ShiftRequirementsInput(BaseModel):
    user_prompt: str = Field(description="ユーザーからのシフト作成依頼の全文")

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

@tool("analyze_shift_requirements", args_schema=ShiftRequirementsInput)
def analyze_shift_requirements_tool(user_prompt: str) -> Dict[str, str]:
    """
    ユーザーの要望を構造化し，段階的にツールに渡しやすいように整理するツール．
    """

    return extracted_reqs

@tool("generate_initial_shift", args_schema=InitialShiftGenerationInput)
def generate_initial_shift_tool(requirements: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    分析された要件に基づいて、最初のバイトシフト案を生成します。
    これはダミーの実装です。実際には複雑なスケジューリングアルゴリズムを含みます。
    """
    print("DEBUG: Generating initial shift...")
    # ここにシフト生成ロジック
    # 例: 簡単なルールベースで生成
    generated_shift = [
        {"date": "2025-07-01", "time": "9:00-17:00", "employee": "Alice", "role": "cashier"},
        {"date": "2025-07-01", "time": "12:00-20:00", "employee": "Bob", "role": "kitchen"},
        # ... 他のシフトエントリ
    ]
    return generated_shift

@tool("evaluate_shift", args_schema=ShiftEvaluationInput)
def evaluate_shift_tool(shift_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    生成されたシフト案を評価し、スコアと改善点を返します。
    スコアは0から100で、高いほど良いシフト。
    """
    print("DEBUG: Evaluating shift...")
    # ここに評価ロジック
    # 例:
    score = 75 # 仮のスコア
    feedback = []
    if any(s['employee'] == 'Bob' and 'Tue' in s['date'] for s in shift_data): # ボブの希望休を考慮しない例
        score -= 10
        feedback.append("Bob's desired day off on Tuesday was not considered.")
    if len(shift_data) < 10: # 仮に総シフト数が少ない場合
        score -= 5
        feedback.append("Total shift entries seem low, consider adding more coverage.")

    return {"score": max(0, score), "feedback": feedback}

@tool("modify_shift", args_schema=ShiftModificationInput)
def modify_shift_tool(shift_data: List[Dict[str, Any]], feedback: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    評価フィードバックを基にシフトを修正します。
    これはダミーの実装です。実際にはより複雑な修正ロジックを含みます。
    """
    print(f"DEBUG: Modifying shift based on feedback: {feedback}")
    modified_shift = list(shift_data) # リストをコピー
    if "Bob's desired day off on Tuesday was not considered." in feedback.get("feedback", []):
        # ボブの火曜日のシフトを削除または変更するロジック
        modified_shift = [s for s in modified_shift if not (s['employee'] == 'Bob' and 'Tue' in s['date'])]
        # あるいは、別の日に振り替えるなどの複雑なロジック
    return modified_shift

@tool("output_shift", args_schema=OutputShiftInput)
def output_shift_tool(shift_data: List[Dict[str, Any]]) -> str:
    """
    最終的なシフトデータをユーザーが読みやすい形式で出力します。
    """
    print("DEBUG: Formatting final shift output...")
    # ここに出力整形ロジック (CSV, Markdown tableなど)
    output_str = "## Final Shift Schedule\n\n"
    output_str += "| Date       | Time Slot   | Employee | Role      |\n"
    output_str += "|------------|-------------|----------|-----------|\n"
    for entry in shift_data:
        output_str += f"| {entry['date']} | {entry['time']} | {entry['employee']} | {entry['role']} |\n"
    return output_str

# 全てのツールをリストとしてエクスポート
all_tools = [
    analyze_shift_requirements_tool,
    generate_initial_shift_tool,
    evaluate_shift_tool,
    modify_shift_tool,
    output_shift_tool
]
