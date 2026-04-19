import asyncio
import uuid
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from unittest.mock import AsyncMock, patch

import pytest

from entities.agent_entities import AgentEntity
from entities.todo_entities import TodoEntity
from listeners.assignment_listener import run_assignment_listener
from repositories.agent_repository import AgentRepository
from repositories.todo_repository import TodoRepository
from services.orchestration_service import OrchestrationService
from sse.manager import SSEManager


@pytest.fixture
def mock_orchestration_service() -> AsyncMock:
  return AsyncMock(spec=OrchestrationService)


@pytest.fixture
def mock_sse_manager() -> AsyncMock:
  return AsyncMock(spec=SSEManager)


@pytest.fixture
def mock_todo_repo() -> AsyncMock:
  return AsyncMock(spec=TodoRepository)


@pytest.fixture
def mock_agent_repo() -> AsyncMock:
  return AsyncMock(spec=AgentRepository)


async def _run_once(
  queue: asyncio.Queue[str],
  orchestration_service: OrchestrationService,
  sse_manager: SSEManager,
  mock_todo_repo: AsyncMock,
  mock_agent_repo: AsyncMock,
) -> None:
  """큐 항목 하나를 처리하고 리스너를 종료한다."""
  mock_session = AsyncMock()

  @asynccontextmanager
  async def fake_session_factory() -> AsyncGenerator[AsyncMock, None]:
    yield mock_session

  with (
    patch("listeners.assignment_listener.async_session_factory", fake_session_factory),
    patch("listeners.assignment_listener.TodoRepository", return_value=mock_todo_repo),
    patch("listeners.assignment_listener.AgentRepository", return_value=mock_agent_repo),
  ):
    task = asyncio.create_task(run_assignment_listener(queue, orchestration_service, sse_manager))
    await queue.join()
    task.cancel()
    await asyncio.gather(task, return_exceptions=True)


async def test_run_assignment_listener_오케스트레이션_서비스로_에이전트를_선택한다(
  mock_orchestration_service: AsyncMock, mock_sse_manager: AsyncMock, mock_todo_repo: AsyncMock, mock_agent_repo: AsyncMock
) -> None:
  todo_id = str(uuid.uuid4())
  todo = TodoEntity(id=todo_id, title="할 일", content="내용", status="pending")
  mock_todo_repo.find_by_id.return_value = todo
  agent = AgentEntity(id="1", name="검색 에이전트", system_prompt="검색 담당")
  mock_agent_repo.get_all.return_value = [agent]
  mock_orchestration_service.select_agent.return_value = "검색 에이전트"
  queue: asyncio.Queue[str] = asyncio.Queue()
  await queue.put(todo_id)

  await _run_once(queue, mock_orchestration_service, mock_sse_manager, mock_todo_repo, mock_agent_repo)

  mock_orchestration_service.select_agent.assert_called_once_with(
    todo,
    agents=[agent],
  )


async def test_run_assignment_listener_에이전트를_todo에_할당한다(
  mock_orchestration_service: AsyncMock, mock_sse_manager: AsyncMock, mock_todo_repo: AsyncMock, mock_agent_repo: AsyncMock
) -> None:
  todo_id = str(uuid.uuid4())
  mock_todo_repo.find_by_id.return_value = TodoEntity(id=todo_id, title="할 일", content="내용", status="pending")
  mock_agent_repo.get_all.return_value = [AgentEntity(id="1", name="검색 에이전트", system_prompt="검색 담당")]
  mock_orchestration_service.select_agent.return_value = "검색 에이전트"
  queue: asyncio.Queue[str] = asyncio.Queue()
  await queue.put(todo_id)

  await _run_once(queue, mock_orchestration_service, mock_sse_manager, mock_todo_repo, mock_agent_repo)

  mock_todo_repo.assign_agent.assert_called_once_with(uuid.UUID(todo_id), "검색 에이전트")


async def test_run_assignment_listener_SSE_이벤트를_발행한다(
  mock_orchestration_service: AsyncMock, mock_sse_manager: AsyncMock, mock_todo_repo: AsyncMock, mock_agent_repo: AsyncMock
) -> None:
  todo_id = str(uuid.uuid4())
  mock_todo_repo.find_by_id.return_value = TodoEntity(id=todo_id, title="할 일", content="내용", status="pending")
  mock_agent_repo.get_all.return_value = [AgentEntity(id="1", name="검색 에이전트", system_prompt="검색 담당")]
  mock_orchestration_service.select_agent.return_value = "검색 에이전트"
  queue: asyncio.Queue[str] = asyncio.Queue()
  await queue.put(todo_id)

  await _run_once(queue, mock_orchestration_service, mock_sse_manager, mock_todo_repo, mock_agent_repo)

  mock_sse_manager.publish.assert_called_once_with(f"TODO_ASSIGN_CHANNEL_{todo_id}", {"type": "assigned", "agent_name": "검색 에이전트"})


async def test_run_assignment_listener_todo가_없으면_건너뛴다(
  mock_orchestration_service: AsyncMock, mock_sse_manager: AsyncMock, mock_todo_repo: AsyncMock, mock_agent_repo: AsyncMock
) -> None:
  todo_id = str(uuid.uuid4())
  mock_todo_repo.find_by_id.return_value = None
  mock_agent_repo.get_all.return_value = []
  queue: asyncio.Queue[str] = asyncio.Queue()
  await queue.put(todo_id)

  await _run_once(queue, mock_orchestration_service, mock_sse_manager, mock_todo_repo, mock_agent_repo)

  mock_orchestration_service.select_agent.assert_not_called()


async def test_run_assignment_listener_에이전트가_없으면_건너뛴다(
  mock_orchestration_service: AsyncMock, mock_sse_manager: AsyncMock, mock_todo_repo: AsyncMock, mock_agent_repo: AsyncMock
) -> None:
  todo_id = str(uuid.uuid4())
  mock_todo_repo.find_by_id.return_value = TodoEntity(id=todo_id, title="할 일", content="내용", status="pending")
  mock_agent_repo.get_all.return_value = []
  queue: asyncio.Queue[str] = asyncio.Queue()
  await queue.put(todo_id)

  await _run_once(queue, mock_orchestration_service, mock_sse_manager, mock_todo_repo, mock_agent_repo)

  mock_orchestration_service.select_agent.assert_not_called()
