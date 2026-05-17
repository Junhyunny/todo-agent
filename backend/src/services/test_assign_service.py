import json
import uuid
from unittest.mock import AsyncMock, MagicMock
from uuid import UUID

import pytest

from agents.orchestration_agent import OrchestrationAgent
from channels.channel_names import TODO_STATUS_CHANNEL
from entities import AgentEntity, TodoEntity
from models.llm_models import TargetAgent
from repositories.agent_repository import AgentRepository
from repositories.todo_repository import TodoRepository
from repositories.unit_of_work import AbstractUnitOfWork
from services.assign_service import AssignService
from sse.manager import SSEManager


@pytest.fixture
def mock_todo_repo() -> AsyncMock:
  return AsyncMock(spec=TodoRepository)


@pytest.fixture
def mock_agent_repo() -> AsyncMock:
  return AsyncMock(spec=AgentRepository)


@pytest.fixture
def mock_orchestration_agent() -> AsyncMock:
  return AsyncMock(spec=OrchestrationAgent)


@pytest.fixture
def mock_sse_manager() -> AsyncMock:
  return AsyncMock(spec=SSEManager)


@pytest.fixture
def mock_unit_of_work(mock_todo_repo: AsyncMock, mock_agent_repo: AsyncMock) -> AsyncMock:
  unit_of_work = AsyncMock(spec=AbstractUnitOfWork)
  unit_of_work.todos = mock_todo_repo
  unit_of_work.agents = mock_agent_repo
  unit_of_work.__aenter__.return_value = unit_of_work
  return unit_of_work


@pytest.fixture
def mock_unit_of_work_factory(mock_unit_of_work: AsyncMock) -> MagicMock:
  return MagicMock(return_value=mock_unit_of_work)


todo_id = str(uuid.uuid4())
todo = TodoEntity(id=todo_id, title="제목", content="내용", status="pending")
agent = AgentEntity(id="1", name="더하기 에이전트", description="더하기 설명", system_prompt="숫자 더하기 담당")
agent.tools = []


def create_sut(
  mock_orchestration_agent: AsyncMock,
  mock_unit_of_work_factory: MagicMock,
  mock_sse_manager: AsyncMock,
) -> AssignService:
  return AssignService(
    orchestration_agent=mock_orchestration_agent,
    unit_of_work_factory=mock_unit_of_work_factory,
    sse_manager=mock_sse_manager,
  )


async def test_select_and_assign_OrchestrationAgent_ainvoke_함수를_호출한다(
  mock_orchestration_agent: AsyncMock,
  mock_unit_of_work_factory: MagicMock,
  mock_unit_of_work: AsyncMock,
  mock_sse_manager: AsyncMock,
) -> None:
  mock_unit_of_work.todos.find_by_id.return_value = todo
  mock_unit_of_work.agents.get_all.return_value = [agent]
  mock_orchestration_agent.ainvoke.return_value = (TargetAgent(name="더하기 에이전트", system_prompt="숫자 더하기 담당"), "이유")
  sut = create_sut(mock_orchestration_agent, mock_unit_of_work_factory, mock_sse_manager)

  await sut.select_and_assign(todo_id)

  mock_orchestration_agent.ainvoke.assert_awaited_once_with(
    json.dumps({"TODO 정보": {"제목": "제목", "내용": "내용"}, "사용 가능한 에이전트": [{"더하기 에이전트": "숫자 더하기 담당"}]})
  )


async def test_select_and_assign_에이전트를_할당하고_AgentEntity를_반환한다(
  mock_orchestration_agent: AsyncMock,
  mock_unit_of_work_factory: MagicMock,
  mock_unit_of_work: AsyncMock,
  mock_sse_manager: AsyncMock,
) -> None:
  mock_unit_of_work.todos.find_by_id.return_value = todo
  mock_unit_of_work.agents.get_all.return_value = [agent]
  mock_orchestration_agent.ainvoke.return_value = (TargetAgent(name="더하기 에이전트", system_prompt="숫자 더하기 담당"), "이유")
  sut = create_sut(mock_orchestration_agent, mock_unit_of_work_factory, mock_sse_manager)

  result = await sut.select_and_assign(todo_id)

  assert result is not None
  assert result.id == "1"
  assert result.name == "더하기 에이전트"
  assert result.description == "더하기 설명"
  assert result.system_prompt == "숫자 더하기 담당"
  assert result.tools == []
  mock_unit_of_work.todos.assign_agent.assert_awaited_once_with(todo_id=UUID(todo_id), agent_name="더하기 에이전트")
  mock_unit_of_work.commit.assert_awaited_once_with()


async def test_select_and_assign_성공시_assigned_SSE를_발행한다(
  mock_orchestration_agent: AsyncMock,
  mock_unit_of_work_factory: MagicMock,
  mock_unit_of_work: AsyncMock,
  mock_sse_manager: AsyncMock,
) -> None:
  mock_unit_of_work.todos.find_by_id.return_value = todo
  mock_unit_of_work.agents.get_all.return_value = [agent]
  mock_orchestration_agent.ainvoke.return_value = (TargetAgent(name="더하기 에이전트", system_prompt="숫자 더하기 담당"), "이유")
  sut = create_sut(mock_orchestration_agent, mock_unit_of_work_factory, mock_sse_manager)

  await sut.select_and_assign(todo_id)

  mock_sse_manager.publish.assert_awaited_once_with(TODO_STATUS_CHANNEL(todo_id), {"type": "assigned"})


async def test_select_and_assign_todo가_없으면_예외를_발생시킨다(
  mock_orchestration_agent: AsyncMock,
  mock_unit_of_work_factory: MagicMock,
  mock_unit_of_work: AsyncMock,
  mock_sse_manager: AsyncMock,
) -> None:
  mock_unit_of_work.todos.find_by_id.return_value = None
  sut = create_sut(mock_orchestration_agent, mock_unit_of_work_factory, mock_sse_manager)

  with pytest.raises(RuntimeError):
    await sut.select_and_assign(todo_id)


async def test_select_and_assign_todo가_없으면_fail_todo를_호출한다(
  mock_orchestration_agent: AsyncMock,
  mock_unit_of_work_factory: MagicMock,
  mock_unit_of_work: AsyncMock,
  mock_sse_manager: AsyncMock,
) -> None:
  mock_unit_of_work.todos.find_by_id.return_value = None
  sut = create_sut(mock_orchestration_agent, mock_unit_of_work_factory, mock_sse_manager)

  with pytest.raises(RuntimeError):
    await sut.select_and_assign(todo_id)

  mock_unit_of_work.todos.fail_todo.assert_awaited_once()


async def test_select_and_assign_todo가_없으면_failed_SSE를_발행한다(
  mock_orchestration_agent: AsyncMock,
  mock_unit_of_work_factory: MagicMock,
  mock_unit_of_work: AsyncMock,
  mock_sse_manager: AsyncMock,
) -> None:
  mock_unit_of_work.todos.find_by_id.return_value = None
  sut = create_sut(mock_orchestration_agent, mock_unit_of_work_factory, mock_sse_manager)

  with pytest.raises(RuntimeError):
    await sut.select_and_assign(todo_id)

  mock_sse_manager.publish.assert_awaited_once_with(TODO_STATUS_CHANNEL(todo_id), {"type": "failed"})


async def test_select_and_assign_에이전트가_없으면_예외를_발생시킨다(
  mock_orchestration_agent: AsyncMock,
  mock_unit_of_work_factory: MagicMock,
  mock_unit_of_work: AsyncMock,
  mock_sse_manager: AsyncMock,
) -> None:
  mock_unit_of_work.todos.find_by_id.return_value = todo
  mock_unit_of_work.agents.get_all.return_value = []
  sut = create_sut(mock_orchestration_agent, mock_unit_of_work_factory, mock_sse_manager)

  with pytest.raises(RuntimeError):
    await sut.select_and_assign(todo_id)

  mock_orchestration_agent.ainvoke.assert_not_called()


async def test_select_and_assign_에이전트가_없으면_실패_이유와_함께_fail_todo를_호출한다(
  mock_orchestration_agent: AsyncMock,
  mock_unit_of_work_factory: MagicMock,
  mock_unit_of_work: AsyncMock,
  mock_sse_manager: AsyncMock,
) -> None:
  mock_unit_of_work.todos.find_by_id.return_value = todo
  mock_unit_of_work.agents.get_all.return_value = []
  sut = create_sut(mock_orchestration_agent, mock_unit_of_work_factory, mock_sse_manager)

  with pytest.raises(RuntimeError):
    await sut.select_and_assign(todo_id)

  mock_unit_of_work.todos.fail_todo.assert_awaited_once_with(uuid.UUID(todo_id), reason="할당 가능한 에이전트가 없습니다")
  mock_unit_of_work.commit.assert_awaited_once_with()


async def test_select_and_assign_에이전트가_없으면_failed_SSE를_발행한다(
  mock_orchestration_agent: AsyncMock,
  mock_unit_of_work_factory: MagicMock,
  mock_unit_of_work: AsyncMock,
  mock_sse_manager: AsyncMock,
) -> None:
  mock_unit_of_work.todos.find_by_id.return_value = todo
  mock_unit_of_work.agents.get_all.return_value = []
  sut = create_sut(mock_orchestration_agent, mock_unit_of_work_factory, mock_sse_manager)

  with pytest.raises(RuntimeError):
    await sut.select_and_assign(todo_id)

  mock_sse_manager.publish.assert_awaited_once_with(TODO_STATUS_CHANNEL(todo_id), {"type": "failed"})


async def test_select_and_assign_오케스트레이션_결과가_None이면_예외를_발생시킨다(
  mock_orchestration_agent: AsyncMock,
  mock_unit_of_work_factory: MagicMock,
  mock_unit_of_work: AsyncMock,
  mock_sse_manager: AsyncMock,
) -> None:
  mock_unit_of_work.todos.find_by_id.return_value = todo
  mock_unit_of_work.agents.get_all.return_value = [agent]
  mock_orchestration_agent.ainvoke.return_value = (None, "처리 불가능한 요청")
  sut = create_sut(mock_orchestration_agent, mock_unit_of_work_factory, mock_sse_manager)

  with pytest.raises(RuntimeError):
    await sut.select_and_assign(todo_id)


async def test_select_and_assign_오케스트레이션_결과가_None이면_LLM_이유와_함께_fail_todo를_호출한다(
  mock_orchestration_agent: AsyncMock,
  mock_unit_of_work_factory: MagicMock,
  mock_unit_of_work: AsyncMock,
  mock_sse_manager: AsyncMock,
) -> None:
  mock_unit_of_work.todos.find_by_id.return_value = todo
  mock_unit_of_work.agents.get_all.return_value = [agent]
  mock_orchestration_agent.ainvoke.return_value = (None, "처리 불가능한 요청")
  sut = create_sut(mock_orchestration_agent, mock_unit_of_work_factory, mock_sse_manager)

  with pytest.raises(RuntimeError):
    await sut.select_and_assign(todo_id)

  mock_unit_of_work.todos.fail_todo.assert_awaited_once_with(uuid.UUID(todo_id), reason="처리 불가능한 요청")
  mock_unit_of_work.commit.assert_awaited_once_with()


async def test_select_and_assign_선택된_에이전트가_없으면_예외를_발생시킨다(
  mock_orchestration_agent: AsyncMock,
  mock_unit_of_work_factory: MagicMock,
  mock_unit_of_work: AsyncMock,
  mock_sse_manager: AsyncMock,
) -> None:
  mock_unit_of_work.todos.find_by_id.return_value = todo
  mock_unit_of_work.agents.get_all.return_value = [agent]
  mock_orchestration_agent.ainvoke.return_value = (TargetAgent(name="없는에이전트", system_prompt="없음"), "이유")
  sut = create_sut(mock_orchestration_agent, mock_unit_of_work_factory, mock_sse_manager)

  with pytest.raises(RuntimeError):
    await sut.select_and_assign(todo_id)


async def test_select_and_assign_선택된_에이전트가_없으면_LLM_이유와_함께_fail_todo를_호출한다(
  mock_orchestration_agent: AsyncMock,
  mock_unit_of_work_factory: MagicMock,
  mock_unit_of_work: AsyncMock,
  mock_sse_manager: AsyncMock,
) -> None:
  mock_unit_of_work.todos.find_by_id.return_value = todo
  mock_unit_of_work.agents.get_all.return_value = [agent]
  mock_orchestration_agent.ainvoke.return_value = (TargetAgent(name="없는에이전트", system_prompt="없음"), "이유")
  sut = create_sut(mock_orchestration_agent, mock_unit_of_work_factory, mock_sse_manager)

  with pytest.raises(RuntimeError):
    await sut.select_and_assign(todo_id)

  mock_unit_of_work.todos.fail_todo.assert_awaited_once_with(uuid.UUID(todo_id), reason="이유")
  mock_unit_of_work.commit.assert_awaited_once_with()
