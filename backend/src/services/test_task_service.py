import uuid
from unittest.mock import AsyncMock, MagicMock
from uuid import UUID

import pytest

from agents.task_agent import TaskAgent
from channels.channel_names import TODO_STATUS_CHANNEL
from entities import AgentEntity, AgentToolEntity, TodoEntity, ToolEntity
from models.tool_codes import ToolCode
from repositories.todo_repository import TodoRepository
from repositories.unit_of_work import AbstractUnitOfWork
from services.task_service import TaskService
from sse.manager import SSEManager


@pytest.fixture
def mock_todo_repo() -> AsyncMock:
  return AsyncMock(spec=TodoRepository)


@pytest.fixture
def mock_task_agent() -> AsyncMock:
  return AsyncMock(spec=TaskAgent)


@pytest.fixture
def mock_sse_manager() -> AsyncMock:
  return AsyncMock(spec=SSEManager)


@pytest.fixture
def mock_unit_of_work(mock_todo_repo: AsyncMock) -> AsyncMock:
  unit_of_work = AsyncMock(spec=AbstractUnitOfWork)
  unit_of_work.todos = mock_todo_repo
  unit_of_work.__aenter__.return_value = unit_of_work
  return unit_of_work


@pytest.fixture
def mock_unit_of_work_factory(mock_unit_of_work: AsyncMock) -> MagicMock:
  return MagicMock(return_value=mock_unit_of_work)


todo_id = str(uuid.uuid4())
todo = TodoEntity(id=todo_id, title="제목", content="내용", status="pending")
agent = AgentEntity(id="1", name="더하기 에이전트", description="더하기 설명", system_prompt="숫자 더하기 담당")
agent.tools = []
web_browser_tool = ToolEntity(id="d4f3b2a1-1234-5678-abcd-ef0123456789", name="웹 검색(web search)", code=ToolCode.WEB_BROWSER_CONTROL)
agent_with_browser_tool = AgentEntity(id="2", name="웹 검색 에이전트", description="웹 검색 설명", system_prompt="웹 검색 담당")
agent_with_browser_tool.tools = [
  AgentToolEntity(agent_id="2", tool_id=web_browser_tool.id, tool=web_browser_tool),
]


def create_sut(
  mock_task_agent: AsyncMock,
  mock_unit_of_work_factory: MagicMock,
  mock_sse_manager: AsyncMock,
) -> TaskService:
  return TaskService(
    task_agent=mock_task_agent,
    unit_of_work_factory=mock_unit_of_work_factory,
    sse_manager=mock_sse_manager,
  )


async def test_execute_and_complete_TaskAgent_ainvoke를_호출한다(
  mock_task_agent: AsyncMock,
  mock_unit_of_work_factory: MagicMock,
  mock_unit_of_work: AsyncMock,
  mock_sse_manager: AsyncMock,
) -> None:
  mock_unit_of_work.todos.find_by_id.return_value = todo
  mock_task_agent.ainvoke.return_value = "처리 완료"
  sut = create_sut(mock_task_agent, mock_unit_of_work_factory, mock_sse_manager)

  await sut.execute_and_complete(todo_id, agent)

  mock_task_agent.ainvoke.assert_awaited_once_with(
    system_prompt="숫자 더하기 담당",
    user_message=f"{todo.title}\n{todo.content}",
    tool_codes=[],
  )


async def test_execute_and_complete_에이전트의_도구_코드를_TaskAgent에_전달한다(
  mock_task_agent: AsyncMock,
  mock_unit_of_work_factory: MagicMock,
  mock_unit_of_work: AsyncMock,
  mock_sse_manager: AsyncMock,
) -> None:
  mock_unit_of_work.todos.find_by_id.return_value = todo
  mock_task_agent.ainvoke.return_value = "처리 완료"
  sut = create_sut(mock_task_agent, mock_unit_of_work_factory, mock_sse_manager)

  await sut.execute_and_complete(todo_id, agent_with_browser_tool)

  mock_task_agent.ainvoke.assert_awaited_once_with(
    system_prompt="웹 검색 담당",
    user_message=f"{todo.title}\n{todo.content}",
    tool_codes=[ToolCode.WEB_BROWSER_CONTROL],
  )


async def test_execute_and_complete_작업_결과를_저장한다(
  mock_task_agent: AsyncMock,
  mock_unit_of_work_factory: MagicMock,
  mock_unit_of_work: AsyncMock,
  mock_sse_manager: AsyncMock,
) -> None:
  mock_unit_of_work.todos.find_by_id.return_value = todo
  mock_task_agent.ainvoke.return_value = "처리 완료"
  sut = create_sut(mock_task_agent, mock_unit_of_work_factory, mock_sse_manager)

  await sut.execute_and_complete(todo_id, agent)

  mock_unit_of_work.todos.complete_todo.assert_awaited_once_with(UUID(todo_id), result="처리 완료")
  mock_unit_of_work.commit.assert_awaited_once_with()


async def test_execute_and_complete_성공시_completed_SSE를_발행한다(
  mock_task_agent: AsyncMock,
  mock_unit_of_work_factory: MagicMock,
  mock_unit_of_work: AsyncMock,
  mock_sse_manager: AsyncMock,
) -> None:
  mock_unit_of_work.todos.find_by_id.return_value = todo
  mock_task_agent.ainvoke.return_value = "처리 완료"
  sut = create_sut(mock_task_agent, mock_unit_of_work_factory, mock_sse_manager)

  await sut.execute_and_complete(todo_id, agent)

  mock_sse_manager.publish.assert_awaited_once_with(TODO_STATUS_CHANNEL(todo_id), {"type": "completed"})


async def test_execute_and_complete_todo가_없으면_예외가_발생한다(
  mock_task_agent: AsyncMock,
  mock_unit_of_work_factory: MagicMock,
  mock_unit_of_work: AsyncMock,
  mock_sse_manager: AsyncMock,
) -> None:
  mock_unit_of_work.todos.find_by_id.return_value = None
  sut = create_sut(mock_task_agent, mock_unit_of_work_factory, mock_sse_manager)

  with pytest.raises(RuntimeError):
    await sut.execute_and_complete(todo_id, agent)


async def test_execute_and_complete_todo가_없으면_fail_todo를_호출한다(
  mock_task_agent: AsyncMock,
  mock_unit_of_work_factory: MagicMock,
  mock_unit_of_work: AsyncMock,
  mock_sse_manager: AsyncMock,
) -> None:
  mock_unit_of_work.todos.find_by_id.return_value = None
  sut = create_sut(mock_task_agent, mock_unit_of_work_factory, mock_sse_manager)

  with pytest.raises(RuntimeError):
    await sut.execute_and_complete(todo_id, agent)

  mock_unit_of_work.todos.fail_todo.assert_awaited_once()


async def test_execute_and_complete_todo가_없으면_failed_SSE를_발행한다(
  mock_task_agent: AsyncMock,
  mock_unit_of_work_factory: MagicMock,
  mock_unit_of_work: AsyncMock,
  mock_sse_manager: AsyncMock,
) -> None:
  mock_unit_of_work.todos.find_by_id.return_value = None
  sut = create_sut(mock_task_agent, mock_unit_of_work_factory, mock_sse_manager)

  with pytest.raises(RuntimeError):
    await sut.execute_and_complete(todo_id, agent)

  mock_sse_manager.publish.assert_awaited_once_with(TODO_STATUS_CHANNEL(todo_id), {"type": "failed"})


async def test_execute_and_complete_예외_발생시_fail_todo를_호출한다(
  mock_task_agent: AsyncMock,
  mock_unit_of_work_factory: MagicMock,
  mock_unit_of_work: AsyncMock,
  mock_sse_manager: AsyncMock,
) -> None:
  mock_unit_of_work.todos.find_by_id.return_value = todo
  mock_task_agent.ainvoke.side_effect = Exception("태스크 실패")
  sut = create_sut(mock_task_agent, mock_unit_of_work_factory, mock_sse_manager)

  with pytest.raises(Exception):
    await sut.execute_and_complete(todo_id, agent)

  mock_unit_of_work.todos.fail_todo.assert_awaited_once()
  mock_unit_of_work.commit.assert_awaited_once_with()


async def test_execute_and_complete_예외_발생시_failed_SSE를_발행한다(
  mock_task_agent: AsyncMock,
  mock_unit_of_work_factory: MagicMock,
  mock_unit_of_work: AsyncMock,
  mock_sse_manager: AsyncMock,
) -> None:
  mock_unit_of_work.todos.find_by_id.return_value = todo
  mock_task_agent.ainvoke.side_effect = Exception("태스크 실패")
  sut = create_sut(mock_task_agent, mock_unit_of_work_factory, mock_sse_manager)

  with pytest.raises(Exception):
    await sut.execute_and_complete(todo_id, agent)

  mock_sse_manager.publish.assert_awaited_once_with(TODO_STATUS_CHANNEL(todo_id), {"type": "failed"})
