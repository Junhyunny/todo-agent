import asyncio
import json
from typing import Any, Dict

from dotenv import load_dotenv
from langchain.agents import create_agent
from langchain_aws import ChatBedrockConverse
from langchain_community.agent_toolkits import PlayWrightBrowserToolkit
from langchain_core.runnables import RunnableConfig
from playwright.async_api import ViewportSize, async_playwright
from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel

load_dotenv()

console = Console(soft_wrap=True)
llm = ChatBedrockConverse(
  # model="jp.anthropic.claude-sonnet-4-6",
  # model="global.anthropic.claude-haiku-4-5-20251001-v1:0",
  model="apac.amazon.nova-pro-v1:0",
  region_name="ap-northeast-1",
)


def print_rule(title: str, color: str) -> None:
  console.rule(f"[bold {color}]{title}[/bold {color}]", style=color)


def print_panel(content: str, title: str, color: str) -> None:
  console.print(
    Panel(
      content,
      title=f"[bold {color}]{title}[/bold {color}]",
      border_style=color,
      expand=True,
    )
  )


def get_input(data: dict) -> str:
  input_data = data.get("input", "")
  if not isinstance(input_data, str):
    input_data = json.dumps(input_data, ensure_ascii=False, indent=2)
  return input_data


def get_message(data: Dict[str, Any]) -> str:
  messages = data["output"].get("messages", [])
  if messages:
    content = messages[-1].content
    if isinstance(content, list):
      return "\n".join(c.get("text", "") if isinstance(c, dict) else str(c) for c in content)
    else:
      return str(content)
  return ""


async def create_browser():
  playwright = await async_playwright().start()
  browser = await playwright.chromium.launch(headless=False)
  viewport_size: ViewportSize = {"width": 1280, "height": 800}
  context = await browser.new_context(
    viewport=viewport_size,
    locale="ko-KR",
  )
  return browser, context


search_prompt = """
  1. 인터넷에서 "Junhyunny"라는 키워드로 검색한다.
  2. 검색 결과 중 TOP 5 사이트들에 방문한다.
  3. 방문 내용들을 요약, 정리 후 최종 답변으로 제시한다.
"""


email_prompt = """
  1. 네이버 로그인 화면으로 진입한다. 사용자의 로그인을 기다린다.
  2. 로그인이 완료된 것을 확인했다면 메일 화면으로 이동한다.
  3. 메일 화면에서 보이는 메일들을 하나씩 열어서 읽는다.
  4. 메일 내용을 요약 후 사용자에게 전달한다.
"""


async def main():
  browser, context = await create_browser()
  toolkit = PlayWrightBrowserToolkit.from_browser(async_browser=browser)
  tools = toolkit.get_tools()
  agent = create_agent(
    model=llm,
    tools=tools,
    system_prompt="""
    You are a web assistant.
    If you need to wait for user's actions, then DO NOT stop the process.
    Wait it until meeting the condition in the user prompt while refetch the web page.
    Fetching interval is at least 5 seconds to use token efficiently.""",
  )

  result = ""
  command = {
    "messages": [
      {
        "role": "user",
        "content": email_prompt,
      }
    ]
  }
  config: RunnableConfig = {"recursion_limit": 1000}

  async for event in agent.astream_events(command, config=config):
    kind = event["event"]
    name = event.get("name", "")
    data = event.get("data")
    if kind == "on_chat_model_start":
      print_rule("Agent is Thinking", "yellow")
    elif kind == "on_tool_start":
      tool_input = get_input(data)
      print_panel(tool_input, name, "cyan")
    elif kind == "on_tool_end":
      output = str(data.get("output", ""))[:300]
      print_panel(output, "Tool Result", "green")
    elif kind == "on_chain_end" and name == "LangGraph":
      result = get_message(data)

  console.print()
  print_rule("Final Answer", "magenta")
  console.print(Markdown(result))
  print_rule("", "magenta")


if __name__ == "__main__":
  asyncio.run(main())
