from unittest.mock import AsyncMock, MagicMock

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from repositories.agent_repository import AgentRepository
from repositories.todo_repository import TodoRepository
from repositories.tool_repository import ToolRepository
from repositories.unit_of_work import SQLAlchemyUnitOfWork


@pytest.fixture
def mock_session() -> AsyncMock:
  return AsyncMock(spec=AsyncSession)


@pytest.fixture
def mock_session_factory(mock_session: AsyncMock) -> MagicMock:
  return MagicMock(return_value=mock_session)


async def test_enter_세션을_생성하고_레포지토리를_초기화한다(mock_session: AsyncMock, mock_session_factory: MagicMock) -> None:
  sut = SQLAlchemyUnitOfWork(session_factory=mock_session_factory)

  async with sut as uow:
    assert isinstance(uow.todos, TodoRepository)
    assert isinstance(uow.agents, AgentRepository)
    assert isinstance(uow.tools, ToolRepository)
    assert uow.todos.session is mock_session
    assert uow.agents.session is mock_session
    assert uow.tools.session is mock_session

  mock_session_factory.assert_called_once_with()


async def test_commit_세션_commit을_호출하고_종료시_rollback하지_않는다(mock_session: AsyncMock, mock_session_factory: MagicMock) -> None:
  sut = SQLAlchemyUnitOfWork(session_factory=mock_session_factory)

  async with sut as uow:
    await uow.commit()

  mock_session.commit.assert_awaited_once_with()
  mock_session.rollback.assert_not_called()
  mock_session.close.assert_awaited_once_with()


async def test_exit_명시적_commit이_없으면_rollback하고_세션을_닫는다(mock_session: AsyncMock, mock_session_factory: MagicMock) -> None:
  sut = SQLAlchemyUnitOfWork(session_factory=mock_session_factory)

  async with sut:
    pass

  mock_session.rollback.assert_awaited_once_with()
  mock_session.close.assert_awaited_once_with()


async def test_exit_예외가_발생하면_rollback하고_세션을_닫는다(mock_session: AsyncMock, mock_session_factory: MagicMock) -> None:
  sut = SQLAlchemyUnitOfWork(session_factory=mock_session_factory)

  with pytest.raises(ValueError, match="boom"):
    async with sut:
      raise ValueError("boom")

  mock_session.rollback.assert_awaited_once_with()
  mock_session.close.assert_awaited_once_with()


async def test_commit_enter_전이면_예외가_발생한다() -> None:
  sut = SQLAlchemyUnitOfWork(session_factory=MagicMock())

  with pytest.raises(RuntimeError, match="UnitOfWork session is not initialized"):
    await sut.commit()
