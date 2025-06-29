import os
import json
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from typing import Dict, List
from langchain_google_genai.chat_models import ChatGoogleGenerativeAI
from langchain.chat_models import init_chat_model
from langchain.tools import tool


# --- Pydantic Models ---
class Shift(BaseModel):
    """Represents a single shift with a day, start time, and finish time."""
    shift_id: str = Field(..., description="The unique identifier for the shift.")
    day: str = Field(..., description="The date of the shift in YYYY-MM-DD format.")
    start: str = Field(..., description="The start time of the shift in HH:MM format.")
    finish: str = Field(..., description="The finish time of the shift in HH:MM format.")

class EditShiftEntry(BaseModel):
    """Represents a single shift entry in the comprehensive schedule."""
    user_id: str = Field(..., description="The name of the worker.")
    company_id: int = Field(..., description="The ID of the company.")
    day: str = Field(..., description="The date of the shift in YYYY-MM-DD format.")
    start_time: str = Field(..., description="The start time of the shift in HH:MM format.")
    finish_time: str = Field(..., description="The finish time of the shift in HH:MM format.")

class EditShiftSchedule(BaseModel):
    """Represents the comprehensive shift schedule for all employees."""
    edit_shift: List[EditShiftEntry] = Field(..., description="A list of shift entries.")

class ShiftEvaluation(BaseModel):
    """Represents the evaluation result of a shift schedule."""
    quantitative_score: int = Field(..., description="The quantitative score of the shift proposal.")
    feedback_japanese: str = Field(..., description="Detailed feedback in Japanese.")

# --- LLM and Environment Setup ---
# 高橋の環境で
# load_dotenv()

# if os.getenv('GOOGLE_API_KEY'):
#   os.environ["GOOGLE_API_KEY"] = os.getenv('GOOGLE_API_KEY')
# else:
#   print("Google API key not found.")
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..')))
from app.secret_manager.secret_key import get_gemini_secret

PROJECT_ID = "jacksen-server"
SECRET_ID = "gemini-api-key"
api_key = get_gemini_secret(PROJECT_ID, SECRET_ID)

llm = init_chat_model(
    model="gemini-2.5-flash",
    model_provider='google_genai',
    temperature=0,
    max_retries=2,
    api_key=api_key
)

# --- LLM-based Tool Helper ---
def call_gemini_model(system_instruction: str, user_content: str) -> str:
    """Calls the Gemini model with a system instruction and user content."""
    messages = [
        ("system", system_instruction),
        ("human", user_content)
    ]
    response = llm.invoke(messages)
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
    system_instruction = """You are an expert shift scheduler and planner. Your primary mission is to create a comprehensive shift schedule for ALL employees, based on the provided JSON data. This data includes company policies, detailed worker information, their individual shift preferences for the specified period, and overall operational constraints.

Your main goal is to generate an optimal shift plan that simultaneously satisfies as many employee shift preferences as possible while strictly adhering to all company policies and operational constraints (e.g., worker availability, required skill levels for each shift, minimum rest periods, labor cost considerations, and specific pairing requirements like rookies with veterans).

You must consider the entire specified scheduling period and all workers when devising the schedule. The input will contain the shift preferences for all workers for this duration. Your output should be a complete shift schedule for all workers over the entire specified duration.

Output only the JSON for the complete shift schedule. Do not include any other text, explanations, or markdown formatting.
The output format must be a JSON object with a single 'edit_shift' key, where the value is an array of shift objects. Each shift object must contain 'user_id', 'company_id', 'day', 'start_time', and 'finish_time' keys. The combination of 'user_id' and 'day' must be unique for each shift.

Example Output:
{
  "edit_shift": [
    { "user_id": "高橋 康成", "company_id": 1, "day": "2025-07-04", "start_time": "09:00", "finish_time": "17:00" },
    { "user_id": "高橋 康成", "company_id": 1, "day": "2025-07-08", "start_time": "10:00", "finish_time": "18:00" },
    { "user_id": "佐藤 照明", "company_id": 1, "day": "2025-07-04", "start_time": "11:00", "finish_time": "19:00" }
  ]
}
    """
    user_content = full_json_input
    response = call_gemini_model(system_instruction, user_content)
    response = response.strip() # LLM応答の先頭・末尾の空白・改行を削除
    # Remove markdown code block if present
    if response.startswith("```json") and response.endswith("```"):
        response = response[len("```json"): -len("```")].strip()
    return response



# --- Shift Evaluate Tool ---
@tool
def eval_shift_tool(input_data: str) -> str:
    """
    Evaluates a proposed shift schedule using a 100-point deduction system.
    The evaluation prioritizes essential criteria like minimum staffing levels
    for different roles (hall, cashier, kitchen) and adherence to labor cost limits.
    Employee shift preferences are considered as a desirable goal. This tool
    provides a quantitative score and detailed feedback in Japanese.

    Args:
        input_data: A JSON string containing both employee preferences and shift draft.
                   Format: '{"employee_preferences": "...", "shift_draft": "..."}'
                   Or a combined string with both data separated by a delimiter.

    Returns:
        A JSON string containing the evaluation results, including a quantitative score
        based on deductions, and specific feedback in Japanese regarding adherence
        to staffing requirements, labor cost constraints, and efforts made to accommodate
        employee shift preferences.
    """

    # Parse input data to extract employee preferences and shift draft
    try:
        # Try to parse as structured JSON first
        data = json.loads(input_data)
        if isinstance(data, dict) and 'employee_preferences' in data and 'shift_draft' in data:
            employee_preferences_json = data['employee_preferences']
            shift_draft_json = data['shift_draft']
        else:
            # Fallback: treat as single string containing both data
            employee_preferences_json = ""
            shift_draft_json = input_data
    except (json.JSONDecodeError, KeyError):
        # Fallback: treat as single string containing both data
        employee_preferences_json = ""
        shift_draft_json = input_data

    system_instruction = """
# 役割
あなたは、飲食店のシフト管理を長年担当してきた、熟練のバーチャル店長です。提供されたシフトデータを基に、冷静かつ客観的な評価を行います。

# タスク
与えられたシフト案を、定義された評価基準に基づいて100点満点から減点方式で採点し、評価スコアと具体的なフィードバックを記述したJSONオブジェクトを生成します。

# 入力データの仕様
入力はJSON形式で提供されます。以下の2つのパターンが存在することを理解してください。
- **パターンA: シフト案 + 希望シフト:** シフト案と従業員の希望シフトの両方が提供されます。
- **パターンB: シフト案のみ:** シフト案のデータのみが提供されます。希望シフトのデータは含まれません。

# 評価基準
初期値を100点とし、以下のルールに基づいて減点します。

### 必須項目
1.  **最低人員配置の未達 (-5点/箇所)**
    - **定義:** シフト内のいずれかの時間帯で、[ホール, レジ, キッチン] のいずれかのポジションに割り当てられた人員が0名の場合。
    - **適用条件:** 不足しているポジションと時間帯の組み合わせ1つにつき、-5点減点します。
    - **必要データ:** シフト案

2.  **人件費の超過 (-10点)**
    - **定義:** シフト全体で計算された総人件費が、指定された予算を1円でも超過している場合。
    - **適用条件:** 超過が確認された場合に一律で-10点減点します。
    - **必要データ:** シフト案, 予算情報

### 努力目標
3.  **従業員の希望シフトとの不一致 (-1点/件)**
    - **定義:** 従業員が提出した「勤務希望日・時間」にシフトが割り当てられていない、または「休日希望日」にシフトが割り当てられている場合。
    - **適用条件:** 不一致1件につき-1点減点します。
    - **重要:** この評価は入力が **パターンA** の場合にのみ実行します。**パターンB** の場合は、この項目の評価は行わず、減点は0点とします。

# 出力形式
- 必ず指定されたキーを持つJSONオブジェクトのみを出力してください。説明文や```json ```などのマークダウンは不要です。

## JSONスキーマ
- `quantitative_score` (number): 100点から減点ルールに基づき算出された最終スコア。
- `feedback_japanese` (string): 以下の構造を持つ、具体的で分かりやすい日本語のフィードバックテキスト。
    1.  **総評:** 「初期スコア100点に対し、-XX点の減点となりました。」のようなサマリー。
    2.  **減点詳細:** 減点項目ごとの内訳を箇条書きで記述。「項目名: -X点」に続けて、問題の具体的な箇所（日付、時間、人員、氏名など）を明記する。
    3.  **改善提案:** 問題解決のための具体的なアクションを提案する。

# 出力例
{
    "quantitative_score": 84,
    "feedback_japanese": "総評：初期スコア100点に対し、-16点の減点となりました。最低人員の配置に課題が見られますが、人件費は予算内に収まっています。\n\n減点詳細：\n- 最低人員配置の未達: -15点\n  - 6月28日 14:00-16:00にホール担当が0人です。（-5点）\n  - 6月29日 12:00-14:00にレジ担当が0人です。（-5点）\n  - 6月29日 21:00-22:00にキッチン担当が0人です。（-5点）\n- 希望シフトとの不一致: -1点\n  - 鈴木太郎さんの土曜午前（9:00-12:00）の希望が反映されていません。\n\n改善提案：\n- 上記の時間帯で不足している各ポジションの人員を至急補充してください。\n- 鈴木さんの希望を再度検討し、可能であればシフト調整を行ってください。"
}
"""
    # Create user content with both employee preferences and shift draft
    user_content = f"Employee Shift Preferences: {employee_preferences_json}\nShift Draft: {shift_draft_json}"

    response = call_gemini_model(system_instruction, user_content)
    response = response.strip()

    # Remove markdown code block if present
    if response.startswith("```json") and response.endswith("```"):
        response = response[len("```json"): -len("```")].strip()
    elif response.startswith("```") and response.endswith("```"):
        response = response[3:-3].strip()

    return response



# --- Shift Modify Tool ---
@tool
def modify_shift_tool(input_data: str) -> str:
    """
    Modifies a proposed shift schedule based on evaluation feedback.
    This tool takes a JSON string containing both the current shift draft and
    evaluation result, and generates a revised shift schedule that addresses
    the identified issues, aiming to improve the evaluation score while
    prioritizing employee preferences.

    Args:
        input_data: A JSON string containing both shift draft and evaluation result.
                   Format: '{"shift_draft": "...", "evaluation_result": "..."}'
                   Or a combined string with both data separated by a delimiter.

    Returns:
        A JSON string representing the modified shift schedule (EditShiftSchedule format).
    """

    # Parse input data to extract shift draft and evaluation result
    try:
        # Try to parse as structured JSON first
        data = json.loads(input_data)
        if isinstance(data, dict) and 'shift_draft' in data and 'evaluation_result' in data:
            shift_draft_json = data['shift_draft']
            evaluation_result_json = data['evaluation_result']
        else:
            # Fallback: treat as single string containing both data
            shift_draft_json = input_data
            evaluation_result_json = ""
    except (json.JSONDecodeError, KeyError):
        # Fallback: treat as single string containing both data
        shift_draft_json = input_data
        evaluation_result_json = ""

    system_instruction = """あなたは熟練したシフト修正者です。与えられたシフト案と、その評価結果（スコアとフィードバック）を基に、シフト案を修正することがあなたの任務です。

**修正の目的:**
* 評価スコアを改善すること。
* フィードバックで指摘された問題を解決すること。
* 可能な限り従業員の希望を尊重すること。

入力として、現在のシフト案（EditShiftSchedule形式のJSON）と、評価結果（ShiftEvaluation形式のJSON）が与えられます。

あなたは、これらの情報を分析し、評価結果のフィードバックに基づいてシフト案を修正してください。特に、減点された項目や、従業員の希望が叶えられていない点を優先的に修正を試みてください。

出力は、修正されたシフトスケジュール全体（EditShiftSchedule形式のJSON）のみである必要があります。他のテキスト、説明、またはマークダウン形式を含めないでください。

出力のJSONフォーマットは、以下のキーを持つオブジェクトである必要があります：
- 'edit_shift': 修正されたシフトエントリのリスト。各エントリは 'user_id', 'company_id', 'day', 'start_time', 'finish_time' を含む必要があります。

例として、以下のようなJSONを出力してください。
{
"edit_shift": [
    { "user_id": "高橋 康成", "company_id": 1, "day": "2025-07-04", "start_time": "09:00", "finish_time": "17:00" },
    { "user_id": "高橋 康成", "company_id": 1, "day": "2025-07-08", "start_time": "10:00", "finish_time": "18:00" },
    { "user_id": "佐藤 照明", "company_id": 1, "day": "2025-07-04", "start_time": "11:00", "finish_time": "19:00" }
]
}

また，特定の日にシフト希望が出されていないなど，評価ツールからのフィードバックを達成することがそもそも難しい場合，特別な値を入れてください．

例として，そのような場合は以下のようにしてください．
{
"edit_shift": [
    { "user_id": "高橋 康成", "company_id": 1, "day": "2025-07-04", "start_time": "09:00", "finish_time": "17:00" },
    { "user_id": "高橋 康成", "company_id": 1, "day": "2025-07-08", "start_time": "10:00", "finish_time": "18:00" },
    { "user_id": "need staff!!!", "company_id": 1, "day": "2025-07-04", "start_time": "11:00", "finish_time": "19:00"}
]
}
    """

    # Create user content with both shift draft and evaluation result
    user_content = f"Current Shift Draft: {shift_draft_json}\nEvaluation Result: {evaluation_result_json}"

    response = call_gemini_model(system_instruction, user_content)
    response = response.strip()

    # Remove markdown code block if present
    if response.startswith("```json") and response.endswith("```"):
        response = response[len("```json"): -len("```")].strip()
    elif response.startswith("```") and response.endswith("```"):
        response = response[3:-3].strip()

    return response



def shift_creator_run(
    shift_request_path: str = "data/inputs/02_sample.json",
    numb_rate_revisions: int = 3
):
    # JSONファイルを読み込み
    with open(shift_request_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        employee_preferences = json.dumps(data, ensure_ascii=False)

    # 初期シフトドラフトを作成
    current_shift = create_shift_draft_tool.invoke(employee_preferences)
    print(current_shift)
    print("シフトドラフトが完成しました．")

    # 評価・修正の繰り返し処理
    for i in range(numb_rate_revisions):
        iteration_num = i + 1

        # シフトの評価
        print(f"{iteration_num}回目のシフトの評価をします．")
        eval_input = json.dumps({
            "employee_preferences": employee_preferences,
            "shift_draft": current_shift
        })
        eval_result = eval_shift_tool.invoke(eval_input)
        print(eval_result)
        print(f"{iteration_num}回目のシフトの評価が完了しました．")

        # シフトの修正
        print(f"{iteration_num}回目のシフトの修正をします．")
        modify_input = json.dumps({
            "shift_draft": current_shift,
            "evaluation_result": eval_result
        })
        current_shift = modify_shift_tool.invoke(modify_input)
        print(current_shift)
        print(f"{iteration_num}回目のシフト修正が完了しました．")
    return current_shift
