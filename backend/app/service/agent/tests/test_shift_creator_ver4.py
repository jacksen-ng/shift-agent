import json
import os
import time  # timeモジュールをインポート
from module.shift_creator import shift_creator_run
from module.shift_creator import eval_final_shift_tool


"""
このモジュールは，従業員のシフト希望からシフトを作成するモジュール．
以下のように使用する．
エージェントとはのたまっているが，シフト作成→[評価→修正] × numb_rate_revisions
を回すだけ．
3回やるとなんか精度が良くなるからデフォルトを3回にしてる．
使う時はコメントアウトを外してね．
"""
def load_dummy_input_json():
    """ダミー入力JSONデータをロードする関数"""
    with open("data/inputs/02_sample.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    return json.dumps(data, ensure_ascii=False)

dummy_data = load_dummy_input_json()


start_time = time.time()  # 実行開始時間を記録
shift_result = shift_creator_run(
    shift_request_path="data/inputs/02_sample.json",
    numb_rate_revisions=1
)
end_time = time.time()  # 実行終了時間を記録

execution_time = end_time - start_time  # 実行時間を計算
print(f"shift_creator_runの実行時間: {execution_time:.4f}秒") # 実行時間を出力 大体30秒

file_path = "data/outputs/final_shift.txt"

with open(file_path, 'w', encoding='utf-8') as file:
    file.write(shift_result)
print("シフト作成実行完了")


# -------------------------------- #


"""
このモジュールは，確定シフトに対して評価をするモジュール．
以下のように使用する，
ちなみに，シフト作成エージェントとは独立したモジュール．
"""
file_path = "data/inputs/05_evaluate-gemini-input.json"
with open(file_path, 'r', encoding='utf-8') as file:
    shift_data = file.read()


print(shift_data)
print("確定シフトが出力されました．")
print("-----------------------")

start_time = time.time()  # 実行開始時間を記録
eval_shift = eval_final_shift_tool(shift_data)
end_time = time.time()  # 実行終了時間を記録
execution_time = end_time - start_time  # 実行時間を計算
print(f"shift_creator_runの実行時間: {execution_time:.4f}秒") # 実行時間を出力 大体1秒
print(eval_shift)
print("評価実行完了")
