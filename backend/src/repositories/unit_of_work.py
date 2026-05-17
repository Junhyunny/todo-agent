from abc import ABC, abstractmethod
from collections.abc import Callable, Sequence
from types import TracebackType
from typing import Protocol
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from entities import AgentEntity, ToolEntity
from entities.todo_entities import TodoEntity
from repositories.agent_repository import AgentRepository
from repositories.database import async_session_factory
from repositories.todo_repository import TodoRepository
from repositories.tool_repository import ToolRepository


class AbstractTodoRepository(Protocol):
  async def create(self, model: TodoEntity) -> TodoEntity: ...

  async def get_all(self) -> Sequence[TodoEntity]: ...

  async def find_by_id(self, todo_id: UUID) -> TodoEntity | None: ...

  async def assign_agent(self, todo_id: UUID, agent_name: str | None) -> TodoEntity: ...

  async def delete(self, todo_id: UUID) -> None: ...

  async def complete_todo(self, todo_id: UUID, result: str) -> None: ...

  async def reset_to_pending(self, todo_id: UUID) -> None: ...

  async def fail_todo(self, todo_id: UUID, reason: str | None = None) -> None: ...


class AbstractAgentRepository(Protocol):
  async def create(self, model: AgentEntity, tool_ids: list[str]) -> AgentEntity: ...

  async def get_all(self) -> Sequence[AgentEntity]: ...

  async def update(self, agent_id: UUID, model: AgentEntity, tool_ids: list[str]) -> AgentEntity: ...

  async def exists_by_name(self, name: str) -> bool: ...

  async def delete(self, agent_id: UUID) -> None: ...


class AbstractToolRepository(Protocol):
  async def get_all(self) -> Sequence[ToolEntity]: ...


class AbstractUnitOfWork(ABC):
  todos: AbstractTodoRepository
  agents: AbstractAgentRepository
  tools: AbstractToolRepository

  def __init__(self) -> None:
    self._committed = False

  async def __aenter__(self) -> "AbstractUnitOfWork":
    self._committed = False
    return self

  async def __aexit__(
    self,
    exc_type: type[BaseException] | None,
    exc_val: BaseException | None,
    exc_tb: TracebackType | None,
  ) -> None:
    if exc_type is not None or not self._committed:
      await self.rollback()

  async def commit(self) -> None:
    await self._commit()
    self._committed = True

  @abstractmethod
  async def _commit(self) -> None:
    raise NotImplementedError

  @abstractmethod
  async def rollback(self) -> None:
    raise NotImplementedError


UnitOfWorkFactory = Callable[[], AbstractUnitOfWork]


class SQLAlchemyUnitOfWork(AbstractUnitOfWork):
  def __init__(self, session_factory: Callable[[], AsyncSession] = async_session_factory) -> None:
    super().__init__()
    self.session_factory = session_factory
    self.session: AsyncSession | None = None

  async def __aenter__(self) -> "SQLAlchemyUnitOfWork":
    self.session = self.session_factory()
    self.todos = TodoRepository(session=self.session)
    self.agents = AgentRepository(session=self.session)
    self.tools = ToolRepository(session=self.session)
    await super().__aenter__()
    return self

  async def __aexit__(
    self,
    exc_type: type[BaseException] | None,
    exc_val: BaseException | None,
    exc_tb: TracebackType | None,
  ) -> None:
    try:
      await super().__aexit__(exc_type, exc_val, exc_tb)
    finally:
      if self.session is not None:
        await self.session.close()
        self.session = None

  async def _commit(self) -> None:
    await self._current_session().commit()

  async def rollback(self) -> None:
    await self._current_session().rollback()

  def _current_session(self) -> AsyncSession:
    if self.session is None:
      raise RuntimeError("UnitOfWork session is not initialized")
    return self.session
