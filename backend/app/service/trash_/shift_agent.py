# %%
import os
import getpass
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI # Google Geminiを使用する場合
from langchain.agents import AgentExecutor, create_react_agent
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from typing import List, Dict, Any
from tools import all_tools # 先ほど定義したツール群をインポート

load_bool = load_dotenv()

class ShiftSchedulingAgent:
    def __init__(self, llm_model_name: str = "gemini-2.0-flash", verbose: bool = True, min_score_threshold: int = 80):
        load_dotenv() # スクリプトの冒頭で一度だけ実行
        google_api_key = os.getenv('GOOGLE_API_KEY')
        if not google_api_key:
            raise ValueError("GOOGLE_API_KEY environment variable not set. Please set it.")

        if "gemini" in llm_model_name:
            self.llm = ChatGoogleGenerativeAI(model=llm_model_name, temperature=0, verbose=verbose)
        else:
            raise ValueError(f"Unsupported LLM model: {llm_model_name}")

        self.tools = all_tools # tools.py からインポート
        self.verbose = verbose
        self.min_score_threshold = min_score_threshold

        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "あなたは熟練したバイトシフト作成アシスタントです。ユーザーから提供されるJSON形式のデータには、"
                    "会社の営業時間、定休日、人件費予算、特別なコメント、そして各従業員の詳細情報（ID、名前、評価、役職、"
                    "経験、雇用形態、時給、そして既存の希望シフト）が含まれています。\n"
                    "このJSONデータと、ユーザーが追加で指定する可能性のある要件を組み合わせて、最適なシフトを生成してください。\n"
                    "シフト作成の目標は、提供された情報に基づいて、**最も効率的で公平な**シフトを生成することです。\n"
                    "生成したシフトは、評価ツールでスコアが"
                    f"{self.min_score_threshold}点以上になるようにし、必要に応じてツールを使って修正してください。\n\n"
                    "応答形式:\n"
                    "Thought: 次に何をすべきかを考えます。JSONデータを解析し、必要な情報をツールに渡すことを優先してください。\n"
                    "Action: 使用するツールの名前 (入力引数)\n"
                    "Observation: ツールの実行結果\n"
                    "... (このThought/Action/Observationのサイクルを繰り返す)\n"
                    "最終的にシフトが完成したら、output_shiftツールを使って出力してください。\n"
                    "評価ツール (evaluate_shift) でスコアが閾値を下回る場合は、feedbackを考慮して"
                    "modify_shiftツールやgenerate_initial_shiftツールを再度呼び出し、改善されたシフトを生成してください。"
                ),
                ("system", "利用可能なツール: {tools}"),
                ("system", "以下のツール名を使用できます: {tool_names}"),
                # ★★★ここが変更点★★★
                # ユーザーの入力は、通常、過去の対話やエージェントの思考履歴の前に来る
                ("human", "{input}"),
                # agent_scratchpad はエージェントの過去の Thought/Action/Observation の履歴なので、
                # ユーザー入力の後に配置するのが自然な流れ
                MessagesPlaceholder(variable_name="agent_scratchpad"),
            ]
        )
        print(f"DEBUG: Prompt input variables: {self.prompt.input_variables}")
        # print(self.prompt)

        self.agent = create_react_agent(self.llm, self.tools, self.prompt)
        self.agent_executor = AgentExecutor(
            agent=self.agent,
            tools=self.tools,
            verbose=self.verbose,
            handle_parsing_errors=True,
            # max_iterations=15, # 試行回数を少し増やしても良いかもしれません
            return_intermediate_steps=True,
        )


    def run(self, raw_json_data: str) -> str: # user_request から raw_json_data に引数名を変更
        """
        バイトシフト作成プロセスを実行します。
        :param raw_json_data: ユーザーからのJSON形式のシフト要件データ
        :return: 完成したシフトの文字列
        """

        # ★追加: invoke に渡される最終的な入力を確認
        invoke_input = {
            "input": raw_json_data,
            "tools": self.tools, # これは AgentExecutor にすでに渡されているので通常不要ですが、デバッグのために残してもOK
            "tool_names": [tool.name for tool in self.tools], # tool_names も確認
            # agent_scratchpad はここで渡すべきではありませんが、もし誤って残していたらここで確認
        }
        print(f"DEBUG: Input to agent_executor.invoke: {invoke_input.keys()}") # キーだけ見ておけばOK
        # print(f"DEBUG: Raw input data length: {len(raw_json_data)}") # データ量が多い場合のために

        # ★追加: create_react_agent で作成された agent オブジェクトの runnable の入力を確認
        # これは少し複雑ですが、根本原因を探るのに役立つ場合があります。
        # self.agent.get_input_schema().schema() が使えるかもしれません。
        # 例: print(f"DEBUG: Agent Runnable Input Schema: {self.agent.get_input_schema().schema()}")
        # ただし、これがエラーになる可能性もあるので、まずは上の invoke_input から。
        # 初回実行時、raw_json_data を analyze_shift_requirements ツールに渡すようLLMに指示させる

        result = self.agent_executor.invoke({
            "input": raw_json_data, # ここで生のJSON文字列を渡す
            "tools": self.tools,
        })
        return result["output"]

# mainブロック
if __name__ == "__main__":
    # JSONファイルを読み込む
    json_file_path = "./agent/data/inputs/02_sample_prototype.json" # 正しいパスに修正してください
    if not os.path.exists(json_file_path):
        print(f"Error: JSON file not found at {json_file_path}")
        exit()

    with open(json_file_path, "r") as f:
        user_input_json = f.read()

    agent = ShiftSchedulingAgent(llm_model_name="gemini-2.0-flash", verbose=True) # "gemini-2.0-flash" でも可

    print("\n--- Running Shift Scheduling Agent with JSON input ---")
    # print(user_input_json)
    final_shift = agent.run(user_input_json)
    print("\n--- Agent Finished ---")
    print(final_shift)

# %%
