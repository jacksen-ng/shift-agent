import json
import os
from module.shift_creator import shift_creator_run
from module.shift_creator import eval_final_shift_tool

# def load_dummy_input_json():
#     with open("data/inputs/02_sample.json", "r", encoding="utf-8") as f:
#         data = json.load(f)
#     return json.dumps(data, ensure_ascii=False)

# dummy_data = load_dummy_input_json()

# shift_result = shift_creator_run(shift_request_path = "data/inputs/02_sample.json", numb_rate_revisions=3)


# file_path = "data/outputs/final_shift.txt"

# with open(file_path, 'w', encoding='utf-8') as file:
#     file.write(shift_result)
# print("終わり！！！！！！")



file_path = "data/inputs/05_evaluate-gemini-input.json"
with open(file_path, 'r', encoding='utf-8') as file:
    shift_data = file.read()


print(shift_data)
print("確定シフトが出力されました．")
print("-----------------------")
eval_shift = eval_final_shift_tool(shift_data)
print(eval_shift)
print("できた．")
