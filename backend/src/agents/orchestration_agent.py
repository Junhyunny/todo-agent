from langchain.agents import create_agent

from agents.large_language_model import get_llm
from models.llm_models import OrchestrationAgentMessage, TargetAgent

SYSTEM_PROMPT = """당신은 할당 오케스트레이터이다.
주어진 TODO와 에이전트 목록을 보고 가장 적합한 에이전트를 선택한다.

적합한 에이전트가 있으면:
- is_applicable: true
- result: 선택한 에이전트 객체 (name, system_prompt 포함)
- reason: 선택 이유

적합한 에이전트가 없으면:
- is_applicable: false
- result: null
- reason: 선택하지 않은 이유
"""


class OrchestrationAgent:
  def __init__(self) -> None:
    self.name = "OrchestrationAgent"
    self.agent = create_agent(model=get_llm(), system_prompt=SYSTEM_PROMPT, response_format=OrchestrationAgentMessage)

  async def ainvoke(self, user_message: str) -> tuple[TargetAgent | None, str]:
    result = await self.agent.ainvoke({"messages": [{"role": "user", "content": user_message}]})  # type: ignore[arg-type]
    structured: OrchestrationAgentMessage = result["structured_response"]
    print(structured)
    if not structured.is_applicable or structured.result is None:
      return None, structured.reason
    return structured.result, structured.reason


def get_orchestration_agent() -> OrchestrationAgent:
  return OrchestrationAgent()
