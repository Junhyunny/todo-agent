import json
import uuid
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from agents.orchestration_agent import OrchestrationAgent
from agents.task_agent import TaskAgent
from entities.agent_entities import AgentEntity
from entities.todo_entities import TodoEntity
from models.llm_models import TargetAgent
from repositories.agent_repository import AgentRepository
from repositories.todo_repository import TodoRepository
from services.orchestration_service import OrchestrationService


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
def mock_task_agent() -> AsyncMock:
  return AsyncMock(spec=TaskAgent)


todo_id = str(uuid.uuid4())
todo = TodoEntity(id=todo_id, title="제목", content="내용", status="pending")
agent = AgentEntity(id="1", name="검색 에이전트", system_prompt="웹 검색 담당")


@asynccontextmanager
async def fake_session_factory() -> AsyncGenerator[AsyncMock, None]:
  yield AsyncMock()


async def test_select_and_assign_OrchestrationAgent_ainvoke_함수를_호출한다(
  mock_orchestration_agent: AsyncMock,
  mock_task_agent: AsyncMock,
  mock_todo_repo: AsyncMock,
  mock_agent_repo: AsyncMock,
) -> None:
  mock_todo_repo.find_by_id.return_value = todo
  mock_agent_repo.get_all.return_value = [agent]
  mock_orchestration_agent.ainvoke.return_value = (TargetAgent(name="검색 에이전트", system_prompt="웹 검색 담당"), "이유")

  with (
    patch("services.orchestration_service.get_task_agent", return_value=mock_task_agent),
    patch("services.orchestration_service.async_session_factory", fake_session_factory),
    patch("services.orchestration_service.TodoRepository", return_value=mock_todo_repo),
    patch("services.orchestration_service.AgentRepository", return_value=mock_agent_repo),
  ):
    sut = OrchestrationService(agent=mock_orchestration_agent)
    await sut.select_and_assign(todo_id)

  mock_orchestration_agent.ainvoke.assert_called_once_with(
    json.dumps({"TODO 정보": {"제목": "제목", "내용": "내용"}, "사용 가능한 에이전트": [{"검색 에이전트": "웹 검색 담당"}]})
  )


async def test_select_and_assign_에이전트를_할당하고_AgentEntity를_반환한다(
  mock_orchestration_agent: AsyncMock,
  mock_task_agent: AsyncMock,
  mock_todo_repo: AsyncMock,
  mock_agent_repo: AsyncMock,
) -> None:
  mock_todo_repo.find_by_id.return_value = todo
  mock_agent_repo.get_all.return_value = [agent]
  mock_orchestration_agent.ainvoke.return_value = (TargetAgent(name="검색 에이전트", system_prompt="웹 검색 담당"), "이유")

  with (
    patch("services.orchestration_service.get_task_agent", return_value=mock_task_agent),
    patch("services.orchestration_service.async_session_factory", fake_session_factory),
    patch("services.orchestration_service.TodoRepository", return_value=mock_todo_repo),
    patch("services.orchestration_service.AgentRepository", return_value=mock_agent_repo),
  ):
    sut = OrchestrationService(agent=mock_orchestration_agent)
    result = await sut.select_and_assign(todo_id)

  assert result is not None
  assert result.name == "검색 에이전트"
  assert result.system_prompt == "웹 검색 담당"
  mock_todo_repo.assign_agent.assert_called_once()
  _, kwargs = mock_todo_repo.assign_agent.call_args
  assert kwargs["agent_name"] == "검색 에이전트"


async def test_select_and_assign_에이전트가_없으면_None을_반환한다(
  mock_orchestration_agent: AsyncMock,
  mock_task_agent: AsyncMock,
  mock_todo_repo: AsyncMock,
  mock_agent_repo: AsyncMock,
) -> None:
  mock_todo_repo.find_by_id.return_value = todo
  mock_agent_repo.get_all.return_value = []

  with (
    patch("services.orchestration_service.get_task_agent", return_value=mock_task_agent),
    patch("services.orchestration_service.async_session_factory", fake_session_factory),
    patch("services.orchestration_service.TodoRepository", return_value=mock_todo_repo),
    patch("services.orchestration_service.AgentRepository", return_value=mock_agent_repo),
  ):
    sut = OrchestrationService(agent=mock_orchestration_agent)
    result = await sut.select_and_assign(todo_id)

  assert result is None
  mock_orchestration_agent.ainvoke.assert_not_called()


async def test_select_and_assign_todo가_없으면_None을_반환한다(
  mock_orchestration_agent: AsyncMock,
  mock_task_agent: AsyncMock,
  mock_todo_repo: AsyncMock,
  mock_agent_repo: AsyncMock,
) -> None:
  mock_todo_repo.find_by_id.return_value = None
  mock_agent_repo.get_all.return_value = [agent]

  with (
    patch("services.orchestration_service.get_task_agent", return_value=mock_task_agent),
    patch("services.orchestration_service.async_session_factory", fake_session_factory),
    patch("services.orchestration_service.TodoRepository", return_value=mock_todo_repo),
    patch("services.orchestration_service.AgentRepository", return_value=mock_agent_repo),
  ):
    sut = OrchestrationService(agent=mock_orchestration_agent)
    result = await sut.select_and_assign(todo_id)

  assert result is None
  mock_orchestration_agent.ainvoke.assert_not_called()


async def test_execute_and_complete_TaskAgent_ainvoke를_호출한다(
  mock_orchestration_agent: AsyncMock,
  mock_task_agent: AsyncMock,
  mock_todo_repo: AsyncMock,
  mock_agent_repo: AsyncMock,
) -> None:
  mock_todo_repo.find_by_id.return_value = todo
  mock_task_agent.ainvoke.return_value = "처리 완료"

  with (
    patch("services.orchestration_service.get_task_agent", return_value=mock_task_agent),
    patch("services.orchestration_service.async_session_factory", fake_session_factory),
    patch("services.orchestration_service.TodoRepository", return_value=mock_todo_repo),
    patch("services.orchestration_service.AgentRepository", return_value=MagicMock()),
  ):
    sut = OrchestrationService(agent=mock_orchestration_agent)
    await sut.execute_and_complete(todo_id, agent)

  mock_task_agent.ainvoke.assert_called_once_with(
    system_prompt="웹 검색 담당",
    user_message=f"{todo.title}\n{todo.content}",
  )


async def test_execute_and_complete_작업_결과를_저장한다(
  mock_orchestration_agent: AsyncMock,
  mock_task_agent: AsyncMock,
  mock_todo_repo: AsyncMock,
  mock_agent_repo: AsyncMock,
) -> None:
  mock_todo_repo.find_by_id.return_value = todo
  mock_task_agent.ainvoke.return_value = "처리 완료"

  with (
    patch("services.orchestration_service.get_task_agent", return_value=mock_task_agent),
    patch("services.orchestration_service.async_session_factory", fake_session_factory),
    patch("services.orchestration_service.TodoRepository", return_value=mock_todo_repo),
    patch("services.orchestration_service.AgentRepository", return_value=MagicMock()),
  ):
    sut = OrchestrationService(agent=mock_orchestration_agent)
    await sut.execute_and_complete(todo_id, agent)

  mock_todo_repo.complete_todo.assert_called_once()
  _, kwargs = mock_todo_repo.complete_todo.call_args
  assert kwargs["result"] == "처리 완료"


async def test_execute_and_complete_todo가_없으면_예외가_발생한다(
  mock_orchestration_agent: AsyncMock,
  mock_task_agent: AsyncMock,
  mock_todo_repo: AsyncMock,
  mock_agent_repo: AsyncMock,
) -> None:
  mock_todo_repo.find_by_id.return_value = None

  with (
    patch("services.orchestration_service.get_task_agent", return_value=mock_task_agent),
    patch("services.orchestration_service.async_session_factory", fake_session_factory),
    patch("services.orchestration_service.TodoRepository", return_value=mock_todo_repo),
    patch("services.orchestration_service.AgentRepository", return_value=MagicMock()),
  ):
    sut = OrchestrationService(agent=mock_orchestration_agent)
    with pytest.raises(RuntimeError):
      await sut.execute_and_complete(todo_id, agent)


async def test_select_and_assign_에이전트가_없으면_실패_이유와_함께_fail_todo를_호출한다(
  mock_orchestration_agent: AsyncMock,
  mock_task_agent: AsyncMock,
  mock_todo_repo: AsyncMock,
  mock_agent_repo: AsyncMock,
) -> None:
  mock_todo_repo.find_by_id.return_value = todo
  mock_agent_repo.get_all.return_value = []

  with (
    patch("services.orchestration_service.get_task_agent", return_value=mock_task_agent),
    patch("services.orchestration_service.async_session_factory", fake_session_factory),
    patch("services.orchestration_service.TodoRepository", return_value=mock_todo_repo),
    patch("services.orchestration_service.AgentRepository", return_value=mock_agent_repo),
  ):
    sut = OrchestrationService(agent=mock_orchestration_agent)
    await sut.select_and_assign(todo_id)

  mock_todo_repo.fail_todo.assert_called_once_with(uuid.UUID(todo_id), reason="할당 가능한 에이전트가 없습니다")


async def test_select_and_assign_오케스트레이션_결과가_None이면_LLM_이유와_함께_fail_todo를_호출한다(
  mock_orchestration_agent: AsyncMock,
  mock_task_agent: AsyncMock,
  mock_todo_repo: AsyncMock,
  mock_agent_repo: AsyncMock,
) -> None:
  mock_todo_repo.find_by_id.return_value = todo
  mock_agent_repo.get_all.return_value = [agent]
  mock_orchestration_agent.ainvoke.return_value = (None, "처리 불가능한 요청")

  with (
    patch("services.orchestration_service.get_task_agent", return_value=mock_task_agent),
    patch("services.orchestration_service.async_session_factory", fake_session_factory),
    patch("services.orchestration_service.TodoRepository", return_value=mock_todo_repo),
    patch("services.orchestration_service.AgentRepository", return_value=mock_agent_repo),
  ):
    sut = OrchestrationService(agent=mock_orchestration_agent)
    await sut.select_and_assign(todo_id)

  mock_todo_repo.fail_todo.assert_called_once_with(uuid.UUID(todo_id), reason="처리 불가능한 요청")


async def test_select_and_assign_선택된_에이전트가_없으면_LLM_이유와_함께_fail_todo를_호출한다(
  mock_orchestration_agent: AsyncMock,
  mock_task_agent: AsyncMock,
  mock_todo_repo: AsyncMock,
  mock_agent_repo: AsyncMock,
) -> None:
  mock_todo_repo.find_by_id.return_value = todo
  mock_agent_repo.get_all.return_value = [agent]
  mock_orchestration_agent.ainvoke.return_value = (TargetAgent(name="없는에이전트", system_prompt="없음"), "이유")

  with (
    patch("services.orchestration_service.get_task_agent", return_value=mock_task_agent),
    patch("services.orchestration_service.async_session_factory", fake_session_factory),
    patch("services.orchestration_service.TodoRepository", return_value=mock_todo_repo),
    patch("services.orchestration_service.AgentRepository", return_value=mock_agent_repo),
  ):
    sut = OrchestrationService(agent=mock_orchestration_agent)
    await sut.select_and_assign(todo_id)

  mock_todo_repo.fail_todo.assert_called_once_with(uuid.UUID(todo_id), reason="이유")
