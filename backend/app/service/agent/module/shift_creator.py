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
    model="gemini-2.0-flash-lite",
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
    { "user_id": 1, "company_id": 1, "day": "2025-07-04", "start_time": "09:00:00", "finish_time": "17:00:00" },
    { "user_id": 1, "company_id": 1, "day": "2025-07-08", "start_time": "10:00:00", "finish_time": "18:00:00" },
    { "user_id": 2, "company_id": 1, "day": "2025-07-04", "start_time": "11:00:00", "finish_time": "19:00:00" }
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

    system_instruction = """あなたは熟練したシフト評価者であり、検証者です。与えられたシフト提案を、初期値100点からの減点方式で厳密に評価することがあなたの主な任務です。

**評価基準（減点項目）:**
1. **最低人員配置の未達:** ユーザーから入力された各ポジションにおいて、最低でもそれぞれ1人ずつスタッフが確保されていない場合、1箇所につき-3点。
2. **人件費の超過:** 設定された人件費の予算を超過している場合、-9点。
3. **従業員のシフト希望の未考慮（努力目標）:** 従業員のシフト希望が叶えられていない場合、1人につき-0.2点。これはあくまで努力目標であり、他の必須項目より優先度は低いです。

入力として、従業員のシフト希望データと、全従業員の指定された期間のシフトスケジュール案を含むJSONデータを受け取ります。このデータには、会社の規則、従業員の詳細情報、個々のシフト希望、および全体的な運用上の制約が含まれます。

あなたの目的は、提案されたシフトスケジュールを評価基準に照らして分析し、従業員の希望と照らし合わせて、以下の情報をJSON形式で提供することです。

* **quantitative_score**: このシフト案の定量的な評価スコア（初期値100点からの減点方式で算出）。
* **feedback_japanese**: 何が問題で、どこを改善すべきかを日本語で具体的に記述したフィードバック。減点された項目や、努力目標に対する評価を含めてください。

出力は、評価結果を示すJSONオブジェクトのみである必要があります。他のテキスト、説明、またはマークダウン形式を含めないでください。

出力のJSONフォーマットは、以下のキーを持つオブジェクトである必要があります：
- 'quantitative_score': 評価基準に基づいて算出されたシフトの定量的なスコア（例：85）。
- 'feedback_japanese': シフト案の問題点、改善点、および評価基準への適合状況を詳細に説明する日本語のテキスト。

例として、以下のようなJSONを出力してください。
{
    "quantitative_score": 79,
    "feedback_japanese": "初期スコア100点から、以下の点が減点されました.\n- ホール人員の不足：-9点 (〇月〇日の12:00-14:00にホール担当が0人でした.)\n- シフト希望の未考慮：-1点 (鈴木太郎さんの土曜午前希望が叶っていません.)\n人件費は予算内に収まっており、レジとキッチンの最低人員は満たされています。ホールの人員不足を解消し、鈴木さんの希望シフトを再検討できるか見てみましょう。"
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
    { "user_id": 1, "company_id": 1, "day": "2025-07-04", "start_time": "09:00:00", "finish_time": "17:00:00" },
    { "user_id": 1, "company_id": 1, "day": "2025-07-08", "start_time": "10:00:00", "finish_time": "18:00:00" },
    { "user_id": 2, "company_id": 1, "day": "2025-07-04", "start_time": "11:00:00", "finish_time": "19:00:00" }
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




def eval_final_shift_tool(input_data: str) -> str:
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
あなたは飲食店のシフトを厳密に評価するAIアシスタントです。与えられたシフトデータ、従業員情報、過去のシフト評価データを基に、以下の評価基準に従ってシフト案を評価し、結果をJSONオブジェクト形式で出力してください。

### 初期スコア
100点

### 評価基準（減点・加点項目）

**1. 最低人員配置の未達（減点）**
- **条件**: ホール、レジ、キッチンの各ポジションにおいて、同じ時間帯にスタッフが1人も配置されていない時間帯が存在する場合。
- **減点**: 1ポジション、1時間帯の不足につき **-3点**。

**2. 人件費の超過（減点）**
- **条件**: シフト全体の総人件費が、設定された人件費予算(`labor_cost`)を超過している場合。
- **減点**: **-2点**。
- **人件費の計算手順**:
    1. 各従業員のシフト時間（"finish_time" - "start_time"）を算出します。
    2. 各従業員の「日給」（シフト時間 × "hour_pay"）を算出します。
    3. 全従業員の日給を合計し、総人件費を算出します。
    4. 算出した総人件費が `labor_cost` を上回っているか判定します。

**3. 過去データとの相関（加点）**
- **分析**: `company_member`情報と`evaluate_decision_shift`（`decision_shift`と`evaluate`を含む）を分析し、「特定の従業員がシフトに多く入ると評価が高くなる/低くなる」といった傾向を把握してください。
- **条件**: 上記の分析結果と、今回評価する確定シフトの従業員構成に正の相関が見られる場合（例: 過去の評価が高いシフトに多く参加していた従業員が、今回のシフトにも適切に配置されているなど）。
- **加点**: **+3点**。

### 入力データ
- `company_member`: 全従業員の情報（時給 "hour_pay" を含む）。
- 確定シフトスケジュールデータ: 評価対象のシフト。
- `evaluate_decision_shift`:
    - `decision_shift`: 過去のシフト履歴。
    - `evaluate`: `decision_shift`に対応する期間のシフト全体の評価。
- `labor_cost`: 人件費の予算。

### 出力フォーマット
'comment'というキーを持つJSONオブジェクト形式で、評価結果のみを出力してください。説明やマークダウンなど、JSON以外のテキストは一切含めないでください。

- 'comment': quantitative_scoreとfeedback_japaneseの内容を中に埋め込んだ，単一のjsonオブジェクト．出力はこの形式に必ず則る．全体的な評価を50文字程度，修正ポイント，修正箇所についてを50文字程度で出力する．これ以外のフォーマットを採用することを固く禁ずる．
    - quantitative_scoreは，初期値100点からの減点・加点を反映した最終的な定量的スコア。
    - feedback_japaneseは，評価結果に関する日本語の具体的なフィードバック。減点・加点された項目とその理由を必ず含めてください。

### 出力例
```json
{
    'comment': '初期スコア100点から，{quantitative_score}と評価しました。\n- 人件費超過: -2点 (予算100,000円に対し、実績105,000円でした。)\n- キッチン人員不足: -3点 (XX月XX日の14:00-15:00のキッチン担当が0人でした。)\n- レジ人員不足: -3点 (XX月XX日の21:00-22:00のレジ担当が0人でした。)\n過去の評価傾向と今回のシフト構成に良い相関が見られたため+2点です。ホール人員は全ての時間帯で満たされています。人件費の削減と、特定時間帯の人員不足の解消が必要です。'
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



def shift_creator_run(
    shift_request_path: str,
    numb_rate_revisions: int = 3
):
    employee_preferences = shift_request_path

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
