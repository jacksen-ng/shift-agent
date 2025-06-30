### **変更点の概要と `shift_creator` モジュールの使用方法**

このセクションでは、シフト作成エージェントの開発過程で行われた主要な変更点と、`module/shift_creator.py` モジュールの使用方法について説明します。

#### **1. 変更点の概要**

シフト作成エージェントは、テスト駆動開発のアプローチで段階的に機能が追加・改善されました。主な変更点は以下の通りです。

*   **初期設定とデータモデルの定義:**
    *   `pyproject.toml` に `langchain`, `pydantic` などの主要な依存関係が定義されていることを確認しました。
    *   `module/shift_creator.py` を新規作成し、`pydantic` を用いてシフト情報 (`Shift` クラス) と従業員のシフトコレクション (`WorkerShift` クラス) の厳密なデータモデルを定義しました。これにより、LLMの出力が常に期待する形式であることを保証します。
    *   `Shift` モデルに、シフトの重複を判定する `overlaps_with` メソッドを追加しました。

*   **基本的なLLMチェーンの構築 (初期段階):**
    *   `ChatGoogleGenerativeAI` をLLMとして使用し、`PydanticOutputParser` を介してLLMの出力を `WorkerShift` モデルにパースする基本的なLangChainチェーンを構築しました。
    *   `PromptTemplate` を使用して、ユーザー入力からシフト情報を抽出するようLLMに指示しました。

*   **テスト環境のセットアップと単体テストの導入:**
    *   `tests/` ディレクトリを作成し、`pytest` を使用して単体テストを記述しました。
    *   `uv add pytest --group dev` コマンドで `pytest` を開発依存関係として追加し、`pyproject.toml` を更新しました。
    *   `uv pip install -e .[dev]` でプロジェクトを編集可能モードでインストールし、テストがモジュールを正しくインポートできるようにしました。
    *   シンプルなシフト作成、複数のシフト作成のテストケースを追加し、基本的な機能が動作することを確認しました。

*   **LangChainエージェントへの移行と制約処理の強化:**
    *   複雑な制約（例: 「新人の田中さんは、必ずベテランの誰かと組ませてください。」）をLLMに考慮させるため、単純なチェーンからLangChainエージェント (`AgentExecutor` と `create_react_agent`) へとアーキテクチャを移行しました。
    *   **ツールの定義:**
        *   `get_worker_details`: 従業員の詳細（経験、既存シフトなど）を取得するツール。
        *   `check_shift_overlap`: 2つのシフトが重複するかどうかを判定するツール。
    *   **エージェントプロンプトの洗練:**
        *   エージェントがこれらのツールを効果的に使用し、制約を遵守しながらシフトを作成するように、プロンプトに詳細な指示を追加しました。
        *   特に、`Final Answer` がマークダウンコードブロックなしの生のJSON文字列として出力されるように、また、制約を満たすためにツールを反復的に使用するように、プロンプトを繰り返し調整しました。
        *   `AgentExecutor` に `handle_parsing_errors=True` を設定し、LLMの出力パースエラーに対する堅牢性を高めました。

これらの変更により、エージェントはユーザーの要求と複雑なビジネス制約の両方を考慮して、構造化されたシフト情報を生成できるようになりました。

#### **2. `module/shift_creator.py` の使用方法**

`module/shift_creator.py` は、LangChainエージェントを介してシフト作成機能を提供します。このモジュールを使用するには、以下の手順に従います。

1.  **必要なモジュールのインポート:**
    `chain` オブジェクトと、ツールがワーカー情報にアクセスできるようにするための `set_worker_info_data` 関数をインポートします。

2.  **ワーカー情報の準備:**
    `data/inputs/02_sample_prototype.json` から `company` と `worker` の情報を読み込み、`set_worker_info_data` 関数に渡します。これにより、`get_worker_details` ツールがワーカー情報を参照できるようになります。

3.  **エージェントの呼び出し:**
    `chain.invoke()` メソッドを使用してエージェントを呼び出します。このメソッドには、以下の引数を辞書形式で渡します。
    *   `input`: ユーザーのシフト作成リクエスト（自然言語）。
    *   `company_info`: 会社の情報（JSON文字列）。
    *   `worker_info`: 全従業員の情報（JSON文字列）。
    *   `constraints`: 会社の制約（文字列）。

4.  **結果のパース:**
    `chain.invoke()` は辞書を返します。その中の `'output'` キーに、エージェントが生成したシフト情報がJSON文字列として含まれています。これを `json.loads()` でパースし、`WorkerShift` Pydanticモデルに変換します。

**使用例:**

```python
import json
from module.shift_creator import chain, WorkerShift, set_worker_info_data

# 1. ワーカー情報の準備
with open("/Users/takahashikaisei/mydir/shift-agent/backend/app/service/agent/data/inputs/02_sample_prototype.json", "r", encoding="utf-8") as f:
    sample_data = json.load(f)

company_info = json.dumps(sample_data["company"], ensure_ascii=False, indent=2)
worker_info_dict = sample_data["worker"]
worker_info = json.dumps(worker_info_dict, ensure_ascii=False, indent=2)
constraints = sample_data["company"]["comment"]

# ツールがワーカー情報にアクセスできるように設定
set_worker_info_data(worker_info_dict)

# 2. ユーザーのシフト作成リクエスト
user_request = "田中さんに2025-07-20の10時から18時までシフトを入れてください。IDは9004です。"

# 3. エージェントの呼び出し
print("--- Invoking Agent ---")
result = chain.invoke({
    "input": user_request,
    "company_info": company_info,
    "worker_info": worker_info,
    "constraints": constraints
})
print("--- Agent Finished ---")

# 4. 結果のパースと表示
try:
    actual_worker_shift = WorkerShift(**json.loads(result["output"]))
    print("\nGenerated Shift:")
    for shift_key, shift_obj in actual_worker_shift.shifts.items():
        print(f"  {shift_key}: Day={shift_obj.day}, Start={shift_obj.start}, Finish={shift_obj.finish}, ID={shift_obj.shift_id}")
except json.JSONDecodeError as e:
    print(f"\nError decoding JSON from agent output: {e}")
    print(f"Agent Raw Output: {result.get('output', 'No output key found')}")
except Exception as e:
    print(f"\nAn unexpected error occurred: {e}")
    print(f"Agent Raw Output: {result.get('output', 'No output key found')}")

```

このモジュールを使用することで、自然言語の指示とビジネス制約に基づいて、柔軟かつ正確なシフト作成が可能になります。
