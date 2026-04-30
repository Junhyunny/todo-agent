from collections.abc import Sequence

from langchain.agents import create_agent
from langchain.agents.structured_output import ToolStrategy
from langchain_core.language_models import BaseChatModel

from models.llm_models import TaskAgentResult
from tools.tool_factory import ToolFactory


class TaskAgent:
  def __init__(self, llm: BaseChatModel, tool_factory: ToolFactory) -> None:
    self.llm = llm
    self.tool_factory = tool_factory

  async def ainvoke(self, system_prompt: str, user_message: str, tool_codes: Sequence[str] | None = None) -> str:
    if not tool_codes:
      tool_codes = []
    async with self.tool_factory.create_tools(list(tool_codes)) as tools:
      agent = (
        create_agent(model=self.llm, tools=tools, system_prompt=system_prompt, response_format=ToolStrategy(TaskAgentResult))
        if tools
        else create_agent(model=self.llm, system_prompt=system_prompt, response_format=ToolStrategy(TaskAgentResult))
      )
      result = await agent.ainvoke({"messages": [{"role": "user", "content": user_message}]})  # type: ignore[arg-type]
    return result["structured_response"].content
