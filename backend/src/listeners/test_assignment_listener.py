import asyncio
import uuid
from unittest.mock import AsyncMock

import pytest

from channels.channel_names import TODO_STATUS_CHANNEL
from entities.agent_entities import AgentEntity
from listeners.assignment_listener import run_assignment_listener
from services.orchestration_service import OrchestrationService
from sse.manager import SSEManager


@pytest.fixture
def mock_orchestration_service() -> AsyncMock:
  return AsyncMock(spec=OrchestrationService)


@pytest.fixture
def mock_sse_manager() -> AsyncMock:
  return AsyncMock(spec=SSEManager)


async def _run_once(
  queue: asyncio.Queue[str],
  orchestration_service: OrchestrationService,
  sse_manager: SSEManager,
) -> None:
  """큐 항목 하나를 처리하고 리스너를 종료한다."""
  task = asyncio.create_task(run_assignment_listener(queue, orchestration_service, sse_manager))
  await queue.join()
  task.cancel()
  await asyncio.gather(task, return_exceptions=True)


agent = AgentEntity(id="1", name="검색 에이전트", system_prompt="검색 담당")


async def test_run_assignment_listener_에이전트를_선택하고_할당한다(mock_orchestration_service: AsyncMock, mock_sse_manager: AsyncMock) -> None:
  todo_id = str(uuid.uuid4())
  mock_orchestration_service.select_and_assign.return_value = agent
  mock_orchestration_service.execute_and_complete.return_value = None
  queue: asyncio.Queue[str] = asyncio.Queue()
  await queue.put(todo_id)

  await _run_once(queue, mock_orchestration_service, mock_sse_manager)

  mock_orchestration_service.select_and_assign.assert_called_once_with(todo_id)


async def test_run_assignment_listener_assigned_SSE_이벤트를_발행한다(mock_orchestration_service: AsyncMock, mock_sse_manager: AsyncMock) -> None:
  todo_id = str(uuid.uuid4())
  mock_orchestration_service.select_and_assign.return_value = agent
  mock_orchestration_service.execute_and_complete.return_value = None
  queue: asyncio.Queue[str] = asyncio.Queue()
  await queue.put(todo_id)

  await _run_once(queue, mock_orchestration_service, mock_sse_manager)

  calls = mock_sse_manager.publish.call_args_list
  assert calls[0].args == (TODO_STATUS_CHANNEL(todo_id), {"type": "assigned", "agent_name": "검색 에이전트"})


async def test_run_assignment_listener_작업을_실행한다(mock_orchestration_service: AsyncMock, mock_sse_manager: AsyncMock) -> None:
  todo_id = str(uuid.uuid4())
  mock_orchestration_service.select_and_assign.return_value = agent
  mock_orchestration_service.execute_and_complete.return_value = None
  queue: asyncio.Queue[str] = asyncio.Queue()
  await queue.put(todo_id)

  await _run_once(queue, mock_orchestration_service, mock_sse_manager)

  mock_orchestration_service.execute_and_complete.assert_called_once_with(todo_id, agent)


async def test_run_assignment_listener_completed_SSE_이벤트를_발행한다(mock_orchestration_service: AsyncMock, mock_sse_manager: AsyncMock) -> None:
  todo_id = str(uuid.uuid4())
  mock_orchestration_service.select_and_assign.return_value = agent
  mock_orchestration_service.execute_and_complete.return_value = None
  queue: asyncio.Queue[str] = asyncio.Queue()
  await queue.put(todo_id)

  await _run_once(queue, mock_orchestration_service, mock_sse_manager)

  calls = mock_sse_manager.publish.call_args_list
  assert calls[1].args == (TODO_STATUS_CHANNEL(todo_id), {"type": "completed", "agent_name": "검색 에이전트"})


async def test_run_assignment_listener_에이전트를_선택하지_못하면_작업을_실행하지_않는다(
  mock_orchestration_service: AsyncMock, mock_sse_manager: AsyncMock
) -> None:
  todo_id = str(uuid.uuid4())
  mock_orchestration_service.select_and_assign.return_value = None
  queue: asyncio.Queue[str] = asyncio.Queue()
  await queue.put(todo_id)

  await _run_once(queue, mock_orchestration_service, mock_sse_manager)

  mock_orchestration_service.execute_and_complete.assert_not_called()


async def test_run_assignment_listener_에이전트를_선택하지_못하면_failed_SSE_이벤트를_발행한다(
  mock_orchestration_service: AsyncMock, mock_sse_manager: AsyncMock
) -> None:
  todo_id = str(uuid.uuid4())
  mock_orchestration_service.select_and_assign.return_value = None
  queue: asyncio.Queue[str] = asyncio.Queue()
  await queue.put(todo_id)

  await _run_once(queue, mock_orchestration_service, mock_sse_manager)

  calls = mock_sse_manager.publish.call_args_list
  assert len(calls) == 1
  assert calls[0].args == (TODO_STATUS_CHANNEL(todo_id), {"type": "failed", "agent_name": ""})
