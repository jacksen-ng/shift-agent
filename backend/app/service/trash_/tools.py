# %%
import os
import json
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional
from google import genai # 'google.genai' から 'google.generativeai' に変更
from google.genai import types # 同上
from langchain_core.tools import tool



# Pydantic モデルはそのまま
# 入力スキーマの定義 (Pydantic)
class ShiftRequirementsInput(BaseModel):
    raw_json_data: str = Field(description="会社と従業員の詳細情報を含むJSON形式の入力データ。")

class InitialShiftGenerationInput(BaseModel):
    requirements: Dict[str, Any] = Field(description="分析されたシフト要件")

class ShiftEvaluationInput(BaseModel):
    shift_data: List[Dict[str, Any]] = Field(description="評価対象のシフトデータ")
    requirements: Dict[str, Any] = Field(description="シフト作成の要件（会社情報、従業員情報、制約など）") # 評価に要件も必要なので追加

class ShiftModificationInput(BaseModel):
    shift_data: List[Dict[str, Any]] = Field(description="修正元のシフトデータ")
    feedback: Dict[str, Any] = Field(description="シフト評価ツールからの改善フィードバック")
    requirements: Dict[str, Any] = Field(description="シフト作成の要件（会社情報、従業員情報、制約など）") # 修正にも要件が必要なので追加

class OutputShiftInput(BaseModel):
    shift_data: List[Dict[str, Any]] = Field(description="最終的なシフトデータ")


# --- Gemini Client の初期化 ---
load_dotenv()
api_key = os.getenv('GOOGLE_API_KEY') # LangChainのChatGoogleGenerativeAIが参照する環境変数名に合わせる
if not api_key:
    raise ValueError("GOOGLE_API_KEY environment variable not set.")
# genai.configure(api_key=api_key) # genai.Client は非推奨になったので configure を使う
# 新しいgoogle.generativeaiライブラリの推奨方法は configure() ですが、
# clientオブジェクトを明示的に作成する場合は genai.GenerativeModel を直接使うこともできます。
# ここでは genai.GenerativeModel をツール内で毎回インスタンス化する形にします。

# 共通のLLM呼び出しヘルパー関数 (各ツールで重複コードを避けるため)
def call_gemini_model(system_instruction: str, user_content: str, model_name: str = "gemini-2.0-flash") -> str:
    """Geminiモデルを呼び出し、システムプロンプトとユーザーコンテンツを渡すヘルパー関数"""
    try:
        model = genai.GenerativeModel(model_name=model_name, system_instruction=system_instruction)
        response = model.generate_content(user_content)
        return response.text
    except Exception as e:
        print(f"Error calling Gemini model: {e}")
        raise

# --- 各ツールの実装 ---

# 以下のツールは，ユーザーのinputが非構造化データである場合に呼び出すツールであり，
# これを呼び出すことでシフト作成のためのjson形式構造化データを作成する．
# つまり，今回はjsonのinputを想定しているため，このツールは必要ない．

# @tool("analyze_shift_requirements", args_schema=ShiftRequirementsInput)
# def analyze_shift_requirements_tool(raw_json_data: str) -> Dict[str, Any]:
#     """
#     ユーザーから提供されたJSONデータ（会社情報、従業員情報、既存の希望シフト、コメントなど）を解析し、
#     シフト作成に必要な要件を構造化された辞書形式で抽出します。
#     """
#     print("DEBUG: Calling analyze_shift_requirements_tool...")
#     system_instruction = """
#     あなたはJSON解析のエキスパートです。与えられたJSON文字列から、以下の情報を正確に抽出し、構造化されたJSON形式で出力してください。
#     - 会社の営業時間 (open_time, close_time)
#     - 定休日 (rest_days: YYYY-MM-DD形式のリスト)
#     - 人件費予算 (labor_cost_budget)
#     - 各従業員の詳細情報（user_id, name, evaluate, positions (リスト), experience, post, hour_pay, desired_shifts (リスト, 各シフトはday, start, finishを持つ)）
#     - 会社コメントに含まれる具体的なシフト作成上の制約（例：「佐藤さんと鈴木さんはできるだけ同じシフトに入れないでください」のような指示は、具体的なルールオブジェクトとして抽出）

#     出力は必ずJSON形式にしてください。JSON以外の余計なテキストは含めないでください。
#     出力JSONの形式例:
#     {
#         "company_details": {
#             "open_time": "09:00",
#             "close_time": "23:00",
#             "rest_days": ["2025-07-01", "2025-07-08"],
#             "labor_cost_budget": 670000,
#             "general_comments": "..."
#         },
#         "employees": [
#             {
#                 "user_id": 101,
#                 "name": "高橋 康成",
#                 "evaluate": 5,
#                 "positions": ["キッチン", "ホール", "レジ"],
#                 "experience": "ベテラン",
#                 "post": "正社員",
#                 "hour_pay": 1500,
#                 "desired_shifts": [
#                     {"shift_id": 1001, "day": "2025-07-02", "start": "11:00", "finish": "20:00"},
#                     ...
#                 ]
#             },
#             ...
#         ],
#         "specific_constraints": [
#             {"type": "avoid_simultaneous", "workers": ["佐藤 照明", "鈴木 一浪"]},
#             {"type": "pair_newbie_with_veteran", "newbie": "田中 昌弘", "veteran_experience_level": "ベテラン"}
#         ]
#     }
#     """

#     try:
#         gemini_response = call_gemini_model(system_instruction, raw_json_data)
#         extracted_reqs = json.loads(gemini_response)
#         return extracted_reqs
#     except json.JSONDecodeError as e:
#         print(f"ERROR: analyze_shift_requirements_tool failed to parse Gemini response JSON: {e}")
#         return {"error": "Failed to parse requirements from LLM output", "details": str(e), "llm_output": gemini_response}
#     except Exception as e:
#         print(f"ERROR: analyze_shift_requirements_tool encountered an error: {e}")
#         raise


@tool("generate_initial_shift", args_schema=InitialShiftGenerationInput)
def generate_initial_shift_tool(requirements: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    分析された要件に基づいて、最初のバイトシフト案を生成します。
    会社の営業時間、従業員のスキル、希望シフト、評価、経験、特別な制約などを考慮し、
    具体的なシフトリスト（各シフトはdate, time_slot, employee, roleを持つ）をJSON配列として出力します。
    出力は必ずJSON形式（List[Dict[str, Any]]）にしてください。
    """
    print("DEBUG: Calling generate_initial_shift_tool...")
    system_instruction = """
    あなたはバイトシフトの作成に非常に長けています。与えられた要件JSONに基づいて、最適なバイトシフト案を生成し、JSON形式のリストで出力してください。
    考慮すべき事項：
    - 会社の営業時間と定休日
    - 各従業員の既存の希望シフト、スキル（position）、評価（evaluate）、経験（experience）、雇用形態（post）、時給（hour_pay）
    - 人件費予算（ただし、これは評価段階で厳密にチェックされるため、ここでは最適な割り当てを優先してください）
    - 特定の制約（例：佐藤さんと鈴木さんはできるだけ同じシフトに入れない、新人の田中さんは必ずベテランの誰かと組ませる）
    - 従業員間の公平なシフト配分（労働時間、役割など）
    - 各時間帯に必要な役割と人数の仮定（もし要件に明確な指定がなければ、一般的な店舗運営を考慮して割り当ててください）
    - シフト期間は、入力JSONの従業員の希望シフトの期間、または7月1日から7月15日までと仮定してください。

    出力はJSON形式のリスト（各要素はシフトの辞書）にしてください。JSON以外の余計なテキストは含めないでください。
    出力JSONの形式例:
    [
        {"date": "2025-07-01", "time_slot": "09:00-17:00", "employee": "高橋 康成", "role": "レジ"},
        {"date": "2025-07-01", "time_slot": "12:00-20:00", "employee": "吉田 正孝", "role": "キッチン"},
        ...
    ]
    """

    user_content = json.dumps(requirements, ensure_ascii=False, indent=2)

    try:
        gemini_response = call_gemini_model(system_instruction, user_content)
        generated_shift = json.loads(gemini_response)
        return generated_shift
    except json.JSONDecodeError as e:
        print(f"ERROR: generate_initial_shift_tool failed to parse Gemini response JSON: {e}")
        return [{"error": "Failed to generate shift from LLM output", "details": str(e), "llm_output": gemini_response}]
    except Exception as e:
        print(f"ERROR: generate_initial_shift_tool encountered an error: {e}")
        raise


@tool("evaluate_shift", args_schema=ShiftEvaluationInput)
def evaluate_shift_tool(shift_data: List[Dict[str, Any]], requirements: Dict[str, Any]) -> Dict[str, Any]:
    """
    生成されたシフト案と要件を比較し、評価スコア（0から100）と具体的な改善点をJSON形式で返します。
    スコアが高いほど良いシフトであることを示します。
    """
    print("DEBUG: Calling evaluate_shift_tool...")
    system_instruction = """
    あなたはバイトシフトの評価エキスパートです。与えられたシフトデータと要件JSONを厳密に比較し、以下の基準に基づいてシフトを評価してください。
    評価基準：
    - 定休日や営業時間外の勤務がないか
    - 各従業員の希望シフトが可能な限り考慮されているか
    - 従業員のスキル（position）と割り当てられた役割が一致しているか
    - 「佐藤さんと鈴木さんはできるだけ同じシフトに入れない」「新人の田中さんは必ずベテランの誰かと組ませる」といった具体的な制約が遵守されているか
    - 人件費予算（labor_cost_budget）をオーバーしていないか
    - 各役割の必要人数が満たされているか（これはLLMがシフト生成時に仮定した必要人数に基づく）
    - 従業員間のシフトの公平性（労働時間の偏りなど）

    評価結果は、スコア（0-100）と、具体的な問題点および改善提案のリストを含むJSON形式で出力してください。
    スコアが低い場合は、具体的な改善提案を明確に記述してください。
    出力は必ずJSON形式にしてください。JSON以外の余計なテキストは含めないでください。
    出力JSONの形式例:
    {
        "score": 75,
        "feedback": [
            "佐藤 照明 と 鈴木 一浪 が2025-07-05の12:00-20:00に同じシフトに入っています。",
            "新人の田中 昌弘 が2025-07-02の18:00-22:00にベテラン従業員なしで割り当てられています。",
            "人件費が予算を10%超過しています。",
            "2025-07-03のキッチン担当が不足しています。"
        ]
    }
    """

    user_content = json.dumps({
        "shift_data": shift_data,
        "requirements": requirements
    }, ensure_ascii=False, indent=2)

    try:
        gemini_response = call_gemini_model(system_instruction, user_content)
        evaluation_result = json.loads(gemini_response)
        # スコアが数値であることを確認し、0-100に収める
        score = evaluation_result.get("score", 0)
        evaluation_result["score"] = max(0, min(100, score))
        return evaluation_result
    except json.JSONDecodeError as e:
        print(f"ERROR: evaluate_shift_tool failed to parse Gemini response JSON: {e}")
        return {"score": 0, "feedback": [f"Failed to parse evaluation from LLM output: {e}"], "llm_output": gemini_response}
    except Exception as e:
        print(f"ERROR: evaluate_shift_tool encountered an error: {e}")
        raise


@tool("modify_shift", args_schema=ShiftModificationInput)
def modify_shift_tool(shift_data: List[Dict[str, Any]], feedback: Dict[str, Any], requirements: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    与えられたシフトデータと評価フィードバック、および元の要件を基に、シフトを修正します。
    改善されたシフトのリストをJSON配列として出力します。
    出力は必ずJSON形式（List[Dict[str, Any]]）にしてください。
    """
    print("DEBUG: Calling modify_shift_tool...")
    system_instruction = """
    あなたはシフト修正のエキスパートです。現在のシフトデータと、それを改善するための具体的なフィードバック、および元の要件JSONが与えられます。
    これらの情報に基づいて、可能な限りフィードバックの指摘を解消する形でシフトを修正し、改善されたシフトのリストをJSON形式で出力してください。
    出力は必ずJSON形式のリスト（各要素はシフトの辞書）にしてください。JSON以外の余計なテキストは含めないでください。
    出力JSONの形式例:
    [
        {"date": "2025-07-01", "time_slot": "09:00-17:00", "employee": "高橋 康成", "role": "レジ"},
        {"date": "2025-07-01", "time_slot": "12:00-20:00", "employee": "吉田 正孝", "role": "キッチン"},
        ...
    ]
    """

    user_content = json.dumps({
        "current_shift_data": shift_data,
        "feedback_to_address": feedback,
        "original_requirements": requirements
    }, ensure_ascii=False, indent=2)

    try:
        gemini_response = call_gemini_model(system_instruction, user_content)
        modified_shift = json.loads(gemini_response)
        return modified_shift
    except json.JSONDecodeError as e:
        print(f"ERROR: modify_shift_tool failed to parse Gemini response JSON: {e}")
        return [{"error": "Failed to modify shift from LLM output", "details": str(e), "llm_output": gemini_response}]
    except Exception as e:
        print(f"ERROR: modify_shift_tool encountered an error: {e}")
        raise


@tool("output_shift", args_schema=OutputShiftInput)
def output_shift_tool(shift_data: List[Dict[str, Any]]) -> str:
    """
    最終的なシフトデータをユーザーが読みやすい形式（Markdownテーブル形式）で出力します。
    """
    print("DEBUG: Calling output_shift_tool...")
    system_instruction = """
    あなたはプロフェッショナルなデータフォーマッターです。与えられたシフトデータ（JSON形式のリスト）を、ユーザーが視覚的に理解しやすいように、整形されたMarkdownテーブル形式の文字列に変換して出力してください。
    テーブルの列は、「日付」「時間帯」「担当従業員」「役割」としてください。
    JSON以外の余計なテキストは含めないでください。
    出力例:
    ## 完成シフト表

    | 日付       | 時間帯     | 担当従業員 | 役割     |
    |------------|------------|------------|----------|
    | 2025-07-01 | 09:00-17:00| 高橋 康成  | レジ     |
    | 2025-07-01 | 12:00-20:00| 吉田 正孝  | キッチン |
    ...
    """

    user_content = json.dumps(shift_data, ensure_ascii=False, indent=2)

    try:
        gemini_response = call_gemini_model(system_instruction, user_content)
        return gemini_response # Geminiが直接Markdown文字列を生成することを期待
    except Exception as e:
        print(f"ERROR: output_shift_tool encountered an error: {e}")
        return f"Error formatting shift output: {e}"

# analyze_shift_requirements_tool も含めて全ツールをリスト化
all_tools = [
    # analyze_shift_requirements_tool,
    generate_initial_shift_tool,
    evaluate_shift_tool,
    modify_shift_tool,
    output_shift_tool
]
