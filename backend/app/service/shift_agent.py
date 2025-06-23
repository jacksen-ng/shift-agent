# shift_agent.py

from langchain_google_genai import ChatGoogleGenerativeAI # Google Geminiを使用する場合
from langchain.agents import AgentExecutor, create_react_agent
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import AIMessage, HumanMessage
from typing import List, Dict, Any

from tools import all_tools # 先ほど定義したツール群をインポート

class ShiftSchedulingAgent:
    def __init__(self, llm_model_name: str = "gemini-2.0-flash", verbose: bool = True, min_score_threshold: int = 80):
        """
        シフト作成LLMエージェントを初期化します。
        :param llm_model_name: 使用するLLMのモデル名
        :param verbose: デバッグ情報を出力するかどうか
        :param min_score_threshold: シフト評価の最低合格点
        """
        if "gemini" in llm_model_name:
            self.llm = ChatGoogleGenerativeAI(model=llm_model_name, temperature=0, verbose=verbose)
        else:
            raise ValueError(f"Unsupported LLM model: {llm_model_name}")

        self.tools = all_tools
        self.verbose = verbose
        self.min_score_threshold = min_score_threshold

        # エージェントのプロンプト定義
        # シフト作成の目標、利用可能なツール、再考ロジックを指示
        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "あなたは熟練したバイトシフト作成アシスタントです。ユーザーの要件に基づいて最適なシフトを生成し、"
                    "必要に応じてツールを使って修正してください。最終的なシフトは、評価スコアが"
                    f"{self.min_score_threshold}点以上になるようにしてください。\n\n"
                    "利用可能なツール:\n{tools}\n\n"
                    "応答形式:\n"
                    "Thought: 次に何をすべきかを考えます。\n"
                    "Action: 使用するツールの名前 (入力引数)\n"
                    "Observation: ツールの実行結果\n"
                    "... (このThought/Action/Observationのサイクルを繰り返す)\n"
                    "最終的にシフトが完成したら、output_shiftツールを使って出力してください。\n"
                    "評価ツール (evaluate_shift) でスコアが閾値を下回る場合は、feedbackを考慮して"
                    "modify_shiftツールやgenerate_initial_shiftツールを再度呼び出し、改善されたシフトを生成してください。"
                    "ユーザーからの入力はjson形式です．"
                ),
                ("placeholder", "{chat_history}"),
                ("human", "{input}"),
                ("placeholder", "{agent_scratchpad}"),
            ]
        )

        # エージェントの作成 (OpenAI Functions/Tools Agentを使用する場合)
        # ReActエージェントを使用する場合は create_react_agent を使う
        self.agent = create_react_agent(self.llm, self.tools, self.prompt)
        self.agent_executor = AgentExecutor(
            agent=self.agent,
            tools=self.tools,
            verbose=self.verbose,
            handle_parsing_errors=True, # パースエラーをハンドル
            max_iterations=10, # 最大試行回数
            return_intermediate_steps=True # 中間ステップも返す
        )

    def run(self, user_request: str) -> str:
        """
        バイトシフト作成プロセスを実行します。
        :param user_request: ユーザーからのシフト作成依頼
        :return: 完成したシフトの文字列
        """
        chat_history = []
        final_output = ""
        current_shift_data: Optional[List[Dict[str, Any]]] = None
        evaluation_score = 0

        # 初回実行
        result = self.agent_executor.invoke({
            "input": user_request,
            "chat_history": chat_history,
            "tools": self.tools # プロンプトにツール情報を渡すために必要
        })

        # ReAct/OpenAI Tools Agentは自動的にツール呼び出しを繰り返すため、
        # ここでは最終結果を直接取得
        final_output = result["output"]

        # もし評価と再考のループをAgentExecutor内で明示的に制御したい（閾値判定をPython側で）場合
        # 以下のようにinvokeをループで囲むことも可能ですが、
        # create_openai_tools_agent や create_react_agent はLLMが内部で再試行を判断することが前提です。
        # 今回のケースでは、プロンプトに再試行の指示を明確に記述することで、LLMに判断を委ねるのがシンプルです。

        # ただし、特定の閾値に達するまで明示的に制御したい場合は、
        # AgentExecutorを直接呼び出すのではなく、より低レベルのChainとして組むか、
        # AgentExecutorの出力を解析して再試行を指示するロジックをここに書く。
        # 例：
        # for i in range(self.max_retries):
        #     result = self.agent_executor.invoke(...)
        #     # resultから評価スコアを抽出し、閾値と比較
        #     # スコアが低い場合、再試行のためのプロンプトを生成し、再度invoke
        #     # break conditions...

        # シンプルなアプローチとしては、LLMに評価ツールを呼び出させ、
        # その結果に基づいて修正ツールを呼び出すようプロンプトで指示するのが良いでしょう。
        # `output_shift` ツールが呼び出されたら、それが最終出力と判断します。

        return final_output


# メインの実行部分
if __name__ == "__main__":
    agent = ShiftSchedulingAgent(llm_model_name="gemini-2.0-flash", verbose=True) # または "gemini-pro"
    user_prompt = """
    7月1日から7月15日までのシフトを作成してください。
    会社の情報と従業員の希望シフトを次に示します．
    """
    with open("./agent/data/inputs/02_sample_prototype.json", "r") as f:
        shift_wish = f"""
        {f.read()}
        """
    user_prompt += shift_wish
    print("user_prompt...", user_prompt)
    print("\n--- Running Shift Scheduling Agent ---")
    final_shift = agent.run(user_prompt)
    print("\n--- Agent Finished ---")
    print(final_shift)
