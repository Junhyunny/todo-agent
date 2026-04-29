from collections.abc import Sequence

from langchain.agents import create_agent
from langchain.agents.structured_output import ToolStrategy

from agents.large_language_model import get_llm
from models.llm_models import TaskAgentResult
from tools.tool_factory import ToolFactory


class TaskAgent:
  def __init__(self) -> None:
    self.llm = get_llm()
    self.tool_factory = ToolFactory()

  async def _ainvoke_llm(self, system_prompt: str, user_message: str) -> str:
    response = await self.llm.ainvoke(
      [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message},
      ]
    )
    return response.content

  async def ainvoke(self, system_prompt: str, user_message: str, tool_codes: Sequence[str] | None = None) -> str:
    if tool_codes:
      async with self.tool_factory.create_tools(list(tool_codes)) as tools:
        if tools:
          agent = create_agent(model=self.llm, tools=tools, system_prompt=system_prompt, response_format=ToolStrategy(TaskAgentResult))
          result = await agent.ainvoke({"messages": [{"role": "user", "content": user_message}]})  # type: ignore[arg-type]
          return result["structured_response"].content
    return await self._ainvoke_llm(system_prompt=system_prompt, user_message=user_message)


def get_task_agent() -> TaskAgent:
  return TaskAgent()
