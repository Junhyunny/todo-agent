import asyncio
import uuid
from unittest.mock import AsyncMock

import pytest

from entities.agent_entities import AgentEntity
from listeners.assignment_listener import run_assignment_listener
from services.assign_service import AssignService
from services.task_service import TaskService


@pytest.fixture
def mock_assign_service() -> AsyncMock:
  return AsyncMock(spec=AssignService)


@pytest.fixture
def mock_task_service() -> AsyncMock:
  return AsyncMock(spec=TaskService)


async def _run_once(
  queue: asyncio.Queue[str],
  assign_service: AssignService,
  task_service: TaskService,
) -> None:
  """큐 항목 하나를 처리하고 리스너를 종료한다."""
  task = asyncio.create_task(run_assignment_listener(queue, assign_service, task_service))
  await queue.join()
  task.cancel()
  await asyncio.gather(task, return_exceptions=True)


agent = AgentEntity(id="1", name="검색 에이전트", system_prompt="검색 담당")


async def test_run_assignment_listener_에이전트를_선택하고_할당한다(mock_assign_service: AsyncMock, mock_task_service: AsyncMock) -> None:
  todo_id = str(uuid.uuid4())
  mock_assign_service.select_and_assign.return_value = agent
  mock_task_service.execute_and_complete.return_value = None
  queue: asyncio.Queue[str] = asyncio.Queue()
  await queue.put(todo_id)

  await _run_once(queue, mock_assign_service, mock_task_service)

  mock_assign_service.select_and_assign.assert_called_once_with(todo_id)


async def test_run_assignment_listener_작업을_실행한다(mock_assign_service: AsyncMock, mock_task_service: AsyncMock) -> None:
  todo_id = str(uuid.uuid4())
  mock_assign_service.select_and_assign.return_value = agent
  mock_task_service.execute_and_complete.return_value = None
  queue: asyncio.Queue[str] = asyncio.Queue()
  await queue.put(todo_id)

  await _run_once(queue, mock_assign_service, mock_task_service)

  mock_task_service.execute_and_complete.assert_called_once_with(todo_id, agent)


async def test_run_assignment_listener_select_and_assign_예외시_execute_and_complete를_호출하지_않는다(
  mock_assign_service: AsyncMock, mock_task_service: AsyncMock
) -> None:
  todo_id = str(uuid.uuid4())
  mock_assign_service.select_and_assign.side_effect = Exception("에이전트 선택 실패")
  queue: asyncio.Queue[str] = asyncio.Queue()
  await queue.put(todo_id)

  await _run_once(queue, mock_assign_service, mock_task_service)

  mock_task_service.execute_and_complete.assert_not_called()


async def test_run_assignment_listener_예외_발생후_다음_항목을_처리한다(mock_assign_service: AsyncMock, mock_task_service: AsyncMock) -> None:
  todo_id_1 = str(uuid.uuid4())
  todo_id_2 = str(uuid.uuid4())
  mock_assign_service.select_and_assign.side_effect = [Exception("첫 번째 실패"), agent]
  mock_task_service.execute_and_complete.return_value = None
  queue: asyncio.Queue[str] = asyncio.Queue()
  await queue.put(todo_id_1)
  await queue.put(todo_id_2)

  task = asyncio.create_task(run_assignment_listener(queue, mock_assign_service, mock_task_service))
  await queue.join()
  task.cancel()
  await asyncio.gather(task, return_exceptions=True)

  assert mock_assign_service.select_and_assign.call_count == 2
