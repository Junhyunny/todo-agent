from typing import Annotated

from fastapi import Depends

from agents.dependencies import get_orchestration_agent, get_task_agent
from agents.large_language_model import get_llm
from pubs.assignment_publisher import AssignmentPublisher
from pubs.dependencies import get_assignment_publisher
from repositories.dependencies import get_unit_of_work, get_unit_of_work_factory
from repositories.unit_of_work import AbstractUnitOfWork
from services.agent_service import AgentService
from services.assign_service import AssignService
from services.task_service import TaskService
from services.todo_service import TodoService
from services.tool_service import ToolService
from sse.dependencies import get_sse_manager
from tools.dependencies import get_tool_factory


def get_agent_service(unit_of_work: Annotated[AbstractUnitOfWork, Depends(get_unit_of_work)]) -> AgentService:
  return AgentService(unit_of_work=unit_of_work)


def create_assign_service() -> AssignService:
  llm = get_llm()
  return AssignService(
    orchestration_agent=get_orchestration_agent(llm=llm),
    unit_of_work_factory=get_unit_of_work_factory(),
    sse_manager=get_sse_manager(),
  )


def create_task_service() -> TaskService:
  llm = get_llm()
  return TaskService(
    task_agent=get_task_agent(llm=llm, tool_factory=get_tool_factory()),
    unit_of_work_factory=get_unit_of_work_factory(),
    sse_manager=get_sse_manager(),
  )


def get_todo_service(
  unit_of_work: Annotated[AbstractUnitOfWork, Depends(get_unit_of_work)],
  publisher: Annotated[AssignmentPublisher, Depends(get_assignment_publisher)],
) -> TodoService:
  return TodoService(
    unit_of_work=unit_of_work,
    publisher=publisher,
  )


def get_tool_service(unit_of_work: Annotated[AbstractUnitOfWork, Depends(get_unit_of_work)]) -> ToolService:
  return ToolService(unit_of_work=unit_of_work)
