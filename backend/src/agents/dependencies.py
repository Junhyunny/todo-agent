from typing import Annotated

from fastapi.params import Depends
from langchain_core.language_models import BaseChatModel

from agents.large_language_model import get_llm
from agents.orchestration_agent import OrchestrationAgent
from agents.task_agent import TaskAgent
from tools.dependencies import get_tool_factory
from tools.tool_factory import ToolFactory


def get_orchestration_agent(
  llm: Annotated[BaseChatModel, Depends(get_llm)],
) -> OrchestrationAgent:
  return OrchestrationAgent(llm=llm)


def get_task_agent(
  llm: Annotated[BaseChatModel, Depends(get_llm)],
  tool_factory: Annotated[ToolFactory, Depends(get_tool_factory)],
) -> TaskAgent:
  return TaskAgent(llm=llm, tool_factory=tool_factory)
