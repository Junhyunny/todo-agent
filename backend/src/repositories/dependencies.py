from typing import Annotated

from fastapi.params import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from repositories.agent_repository import AgentRepository
from repositories.database import get_session
from repositories.todo_repository import TodoRepository
from repositories.tool_repository import ToolRepository


def get_agent_repository(session: Annotated[AsyncSession, Depends(get_session)]) -> AgentRepository:
  return AgentRepository(session=session)


def get_todo_repository(session: Annotated[AsyncSession, Depends(get_session)]) -> TodoRepository:
  return TodoRepository(session=session)


def get_tool_repository(session: Annotated[AsyncSession, Depends(get_session)]) -> ToolRepository:
  return ToolRepository(session=session)
