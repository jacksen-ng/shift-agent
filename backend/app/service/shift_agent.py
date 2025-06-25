# %%
import os
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.messages import HumanMessage
from google import genai
from google.genai import types
# from tools import llm_with_tools

load_dotenv()

if os.getenv('GOOGLE_API_KEY'):
  os.environ["GOOGLE_API_KEY"] = os.getenv('GOOGLE_API_KEY')
  api_key = os.environ["GOOGLE_API_KEY"]
else:
  print("うまくいってないよ")


llm = init_chat_model("gemini-2.0-flash", model_provider="google_genai")
llm_with_tools = llm.bind_tools(all_tools)


from langchain_core.tools import tool


def call_gemini_model(
  system_instruction: str,
  user_content: str,
  model_name: str = "gemini-2.0-flash",
  api_key=api_key
) -> str:
    """Geminiモデルを呼び出し、システムプロンプトとユーザーコンテンツを渡すヘルパー関数"""
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
      model="gemini-2.0-flash",
      config=types.GenerateContentConfig(
        system_instruction=system_instruction
      ),
      contents=user_content,
    )
    return response.text



@tool
def multiply(user_content: str) -> str:
    """
    Multiply two numbers.
    """
    system_instruction = """
    あなたは乗算を担当とするエージェントです．
    ユーザーからのinputに対し，適切に掛け算を行ってください．
    inputはその結果のみとし，冗長な出力を禁止します．
    """
    result = call_gemini_model(
      system_instruction=system_instruction,
      user_content=user_content
    )
    return result

@tool
def add(user_content: str) -> str:
    """
    add two numbers.
    """
    system_instruction = """
    あなたは加法を担当とするエージェントです．
    ユーザーからのinputに対し，適切に足し算を行ってください．
    inputはその結果のみとし，冗長な出力を禁止します．
    """
    result = call_gemini_model(
      system_instruction=system_instruction,
      user_content=user_content
    )
    return result

@tool
def hello(user_content: str) -> str:
    """
    return hello for user.
    """
    system_instruction = """
    あなたはユーザーに挨拶することを担当としたエージェントです．
    ユーザーからのinputに対し，テンションを合わせ，挨拶をしてください．
    また，ユーザーが名乗っている場合は，名前を呼んであげましょう．
    出力は挨拶のみ，冗長な出力を禁止します．
    """
    result = call_gemini_model(
      system_instruction=system_instruction,
      user_content=user_content
    )
    return result



all_tools = [
    multiply,
    add,
    hello
]

llm_with_tools = llm.bind_tools(all_tools)
# # query = "my name is kaisei! hello! plase answer... What is 3 * 12? Also, what is 11 + 49?"

# llm_with_tools.invoke(query).tool_calls


query = "my name is kaisei! hello! plase answer... What is 3 * 12? Also, what is 11 + 49?"

messages = [HumanMessage(query)]
ai_msg = llm_with_tools.invoke(messages)
messages.append(ai_msg)

for tool_call in ai_msg.tool_calls:
    selected_tool = {"add": add, "multiply": multiply, "hello": hello}[tool_call["name"].lower()]
    tool_msg = selected_tool.invoke(tool_call)
    messages.append(tool_msg)

llm_with_tools.invoke(messages)

# %%
