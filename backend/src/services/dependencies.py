from typing import Annotated

from fastapi import Depends

from agents.dependencies import get_orchestration_agent, get_task_agent
from agents.large_language_model import get_llm
from pubs.assignment_publisher import AssignmentPublisher
from pubs.dependencies import get_assignment_publisher
from repositories.agent_repository import AgentRepository
from repositories.dependencies import get_agent_repository, get_todo_repository, get_tool_repository
from repositories.todo_repository import TodoRepository
from repositories.tool_repository import ToolRepository
from services.agent_service import AgentService
from services.orchestration_service import OrchestrationService
from services.todo_service import TodoService
from services.tool_service import ToolService
from tools.dependencies import get_tool_factory


def get_agent_service(agent_repository: Annotated[AgentRepository, Depends(get_agent_repository)]) -> AgentService:
  return AgentService(agent_repository=agent_repository)


def create_orchestration_service() -> OrchestrationService:
  llm = get_llm()
  return OrchestrationService(
    orchestration_agent=get_orchestration_agent(llm=llm),
    task_agent=get_task_agent(
      llm=llm,
      tool_factory=get_tool_factory(),
    ),
  )


def get_todo_service(
  todo_repository: Annotated[TodoRepository, Depends(get_todo_repository)],
  publisher: Annotated[AssignmentPublisher, Depends(get_assignment_publisher)],
) -> TodoService:
  return TodoService(
    todo_repository=todo_repository,
    publisher=publisher,
  )


def get_tool_service(tool_repository: Annotated[ToolRepository, Depends(get_tool_repository)]) -> ToolService:
  return ToolService(tool_repository=tool_repository)
