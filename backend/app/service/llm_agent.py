#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
LLMエージェント基盤の実装

このファイルは、LangChainやgeminiAPIを利用することを前提とした統合エージェントの基盤実装です。
エージェントは「計画」「タスク実行」「評価」の各フェーズを順次内部メソッドとして処理し、
最終的なレスポンスとしてJSON形式の出力を返します。

また、エージェントごとにクラスを分割する代わりに、一つの統合クラスに全フェーズをまとめることで、
最終出力のみがJSON形式となるよう設計しています。

将来的には、gemini-2.0-flash等のモデル特有の実装へ変更可能なように、LLM呼び出し部分は
gemini_callメソッド内でラップしています。
"""


# %%
from typing import Any, Dict
from langchain_google_genai import ChatGoogleGenerativeAI
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types
import getpass
import os
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv("./.env")
API_KEY = os.getenv("GEMINI_API")
os.environ["GOOGLE_API_KEY"] = API_KEY


llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
    google_api_key=API_KEY
)

messages = [
    (
        "system",
        "You are a helpful assistant that translates English to French. Translate the user sentence.",
    ),
    ("human", "I love programming."),
]
ai_msg = llm.invoke(messages)
print(ai_msg.content)
# %%

class LLMAgent:
    def __init__(self) -> None:
        """
        初期化処理:
          - GeminiLLM (または他のLLMラッパー) のセットアップを行います。
          - 利用可能な場合は、LangChainのGeminiLLMを利用します。
        """
        # GeminiLLMが利用可能ならインスタンス化する例:
        # if GeminiLLM:
        #     self.llm = GeminiLLM(model_name="gemini-2.0-flash", temperature=0.7)
        # else:
        #     self.llm = None
        self.llm = None

    def gemini_call(self, prompt: str) -> str:
        """
        geminiAPI/LangChainを使用して、指定されたプロンプトに基づくLLMの応答を取得します。
        利用可能なLLMラッパーがセットアップされていればそれを利用し、
        なければダミー実装としてプロンプト内容を返します。
        """
        if self.llm:
            # 実装例: self.llm(prompt) または self.llm.generate([prompt])
            return self.llm(prompt)
        else:
            return f"LLM応答({prompt})"

    def plan(self, message: str) -> str:
        """
        計画フェーズ:
          入力メッセージに基づいた実行計画を立案します。
        """
        prompt = f"Plan: {message}"
        return self.gemini_call(prompt)

    def execute_task(self, plan: str) -> str:
        """
        タスク実行フェーズ:
          立案された計画に基づいてタスクを実行します。
        """
        prompt = f"Execute: {plan}"
        return self.gemini_call(prompt)

    def evaluate(self, result: str) -> str:
        """
        評価フェーズ:
          タスク実行結果を評価し、最終的なレスポンスを生成します。
        """
        prompt = f"Evaluate: {result}"
        return self.gemini_call(prompt)

    def run(self, message: str) -> Dict[str, Any]:
        """
        統合エージェントの実行フロー:
          1. 計画フェーズ
          2. タスク実行フェーズ
          3. 評価フェーズ
        最終的な評価結果をJSON形式として返します。
        """
        plan_result = self.plan(message)
        task_result = self.execute_task(plan_result)
        final_evaluation = self.evaluate(task_result)
        return {"final_result": final_evaluation}

def main(input_json: str) -> str:
    """
    JSON形式の入力を受け取り、LLMAgentのrunメソッドを実行後に、
    最終結果をJSON形式の文字列で返します。
    入力例: {"message": "エージェントへ指示する文"}
    """
    try:
        input_data = json.loads(input_json)
        message = input_data.get("message", "")
    except json.JSONDecodeError:
        return json.dumps({"error": "入力JSONが不正です"}, ensure_ascii=False)

    agent = LLMAgent()
    final_output = agent.run(message)
    return json.dumps(final_output, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    # サンプル入力例
    sample_input = json.dumps({"message": "こんにちは、エージェント！"})
    output = main(sample_input)
    print(output)
