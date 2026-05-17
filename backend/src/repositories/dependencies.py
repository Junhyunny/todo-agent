from typing import Annotated

from fastapi.params import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from repositories.agent_repository import AgentRepository
from repositories.database import async_session_factory, get_session
from repositories.todo_repository import TodoRepository
from repositories.tool_repository import ToolRepository
from repositories.unit_of_work import AbstractUnitOfWork, SQLAlchemyUnitOfWork, UnitOfWorkFactory


def get_agent_repository(session: Annotated[AsyncSession, Depends(get_session)]) -> AgentRepository:
  return AgentRepository(session=session)


def get_todo_repository(session: Annotated[AsyncSession, Depends(get_session)]) -> TodoRepository:
  return TodoRepository(session=session)


def get_tool_repository(session: Annotated[AsyncSession, Depends(get_session)]) -> ToolRepository:
  return ToolRepository(session=session)


def get_unit_of_work() -> AbstractUnitOfWork:
  return SQLAlchemyUnitOfWork(session_factory=async_session_factory)


def get_unit_of_work_factory() -> UnitOfWorkFactory:
  return lambda: SQLAlchemyUnitOfWork(session_factory=async_session_factory)
