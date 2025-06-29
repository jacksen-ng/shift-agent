import json
import os
from unittest.mock import patch
from module.shift_creator import create_shift_draft_tool, EditShiftSchedule, EditShiftEntry, eval_shift_tool, ShiftEvaluation, modify_shift_tool

# Load dummy input JSON data
def load_dummy_input_json():
    with open("data/inputs/02_sample.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    return json.dumps(data, ensure_ascii=False)

# Set GOOGLE_API_KEY for direct execution
# if not os.getenv('GOOGLE_API_KEY'):
#     print("WARNING: GOOGLE_API_KEY environment variable not set. Tool might fail if it makes actual API calls.")

dummy_data = load_dummy_input_json()

draft_json = create_shift_draft_tool.invoke(dummy_data)
file_path = "data/outputs/draft_json.txt"
with open(file_path, 'w', encoding='utf-8') as file:
    file.write(draft_json)
print(f"データが '{file_path}' に正常に保存されました。")
with open("data/outputs/draft_json.txt", "r", encoding='utf-8') as f:
    draft_json = f.read()
print(draft_json)
# 方法1: 構造化JSONとして渡す（推奨）
input_data = json.dumps({
    "employee_preferences": dummy_data,  # 従業員の希望データ
    "shift_draft": draft_json                          # シフトドラフト
})
eval_result_json = eval_shift_tool.invoke(input_data)

# # 方法2: 単純な文字列として渡す
# combined_input = f"Employee Preferences: {employee_preferences_json}\nShift Draft: {draft_json}"
# eval_result_json = eval_shift_tool.invoke(combined_input) draft from previous step
file_path = "data/outputs/eval_result_json.txt"

with open(file_path, 'w', encoding='utf-8') as file:
    file.write(eval_result_json)
print(f"データが '{file_path}' に正常に保存されました。")
with open("data/outputs/eval_result_json.txt", "r", encoding='utf-8') as f:
    eval_result_json = f.read()
print(eval_result_json)
import json
# 方法1: 構造化JSONとして渡す（推奨）
input_data = json.dumps({
    "shift_draft": draft_json,
    "evaluation_result": eval_result_json
})
modified_json = modify_shift_tool.invoke(input_data)

# # 方法2: 単純な文字列として渡す
# combined_input = f"Shift Draft: {draft_json}\nEvaluation Result: {eval_result_json}"
# modified_json = modify_shift_tool.invoke(combined_input)
modified_json
file_path = "data/outputs/modified_json.txt"

with open(file_path, 'w', encoding='utf-8') as file:
    file.write(modified_json)
print(f"データが '{file_path}' に正常に保存されました。")
with open("data/outputs/modified_json.txt", "r", encoding='utf-8') as f:
    modified_json = f.read()
print(modified_json)
# 方法1: 構造化JSONとして渡す（推奨）
input_data = json.dumps({
    "employee_preferences": dummy_data,  # 従業員の希望データ
    "shift_draft": modified_json                          # シフトドラフト
})
eval_result_json_2 = eval_shift_tool.invoke(input_data)
eval_result_json_2
file_path = "data/outputs/eval_result_json_2.txt"

with open(file_path, 'w', encoding='utf-8') as file:
    file.write(eval_result_json_2)
print(f"データが '{file_path}' に正常に保存されました。")
# 方法1: 構造化JSONとして渡す（推奨）
input_data = json.dumps({
    "shift_draft": modified_json,
    "evaluation_result": eval_result_json_2
})
modified_json_2 = modify_shift_tool.invoke(input_data)
modified_json_2
file_path = "data/outputs/modified_json_2.txt"

with open(file_path, 'w', encoding='utf-8') as file:
    file.write(modified_json_2)
print(f"データが '{file_path}' に正常に保存されました。")
print(modified_json_2)
# 方法1: 構造化JSONとして渡す（推奨）
input_data = json.dumps({
    "employee_preferences": dummy_data,  # 従業員の希望データ
    "shift_draft": modified_json_2                          # シフトドラフト
})
eval_result_json_3 = eval_shift_tool.invoke(input_data)
eval_result_json_3
print(eval_result_json_3)
file_path = "data/outputs/eval_result_json_3.txt"

with open(file_path, 'w', encoding='utf-8') as file:
    file.write(eval_result_json_3)
print(f"データが '{file_path}' に正常に保存されました。")
