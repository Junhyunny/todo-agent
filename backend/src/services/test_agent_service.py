import uuid
from numbers import Number
from unittest.mock import AsyncMock

import pytest

from entities import AgentEntity, AgentToolEntity
from repositories.agent_repository import AgentRepository
from repositories.unit_of_work import AbstractUnitOfWork
from schemas.agent_api_schema import AgentRequest
from services.agent_service import AgentService


@pytest.fixture
def mock_agent_repository():
  return AsyncMock(spec=AgentRepository)


@pytest.fixture
def mock_unit_of_work(mock_agent_repository: AsyncMock) -> AsyncMock:
  unit_of_work = AsyncMock(spec=AbstractUnitOfWork)
  unit_of_work.agents = mock_agent_repository
  unit_of_work.__aenter__.return_value = unit_of_work
  return unit_of_work


def make_agent_entity(index: Number, agent_id: uuid.UUID, tool_ids: list[str] | None = None) -> AgentEntity:
  entity = AgentEntity(id=str(agent_id), name=f"에이전트{index}", description=f"설명{index}", system_prompt=f"프롬프트{index}")
  entity.tools = [AgentToolEntity(agent_id=str(agent_id), tool_id=tid) for tid in (tool_ids or [])]
  return entity


async def test_create_agent_레포지토리_create_함수를_호출한다(mock_unit_of_work: AsyncMock):
  expected_id = uuid.uuid4()
  tool_id = str(uuid.uuid4())
  mock_unit_of_work.agents.create.return_value = make_agent_entity(1, expected_id, [tool_id])
  sut = AgentService(unit_of_work=mock_unit_of_work)

  await sut.create_agent(request=AgentRequest(name="에이전트1", description="설명1", system_prompt="프롬프트1", tools=[tool_id]))

  mock_unit_of_work.agents.create.assert_awaited_once()
  _, kwargs = mock_unit_of_work.agents.create.call_args
  assert kwargs["model"].name == "에이전트1"
  assert kwargs["model"].description == "설명1"
  assert kwargs["model"].system_prompt == "프롬프트1"
  assert kwargs["tool_ids"] == [tool_id]
  mock_unit_of_work.commit.assert_awaited_once_with()


async def test_create_agent_레포지토리를_통해_정보를_저장_후_반환한다(mock_unit_of_work: AsyncMock):
  expected_id = uuid.uuid4()
  tool_id = str(uuid.uuid4())
  mock_unit_of_work.agents.create.return_value = make_agent_entity(1, expected_id, [tool_id])
  sut = AgentService(unit_of_work=mock_unit_of_work)

  result = await sut.create_agent(request=AgentRequest(name="에이전트1", description="설명1", system_prompt="프롬프트1", tools=[tool_id]))

  assert result.id == expected_id
  assert result.name == "에이전트1"
  assert result.description == "설명1"
  assert result.system_prompt == "프롬프트1"
  assert result.tools == [tool_id]


async def test_create_agent_레포지토리에서_예외가_발생하면_commit하지_않는다(mock_unit_of_work: AsyncMock) -> None:
  tool_id = str(uuid.uuid4())
  mock_unit_of_work.agents.create.side_effect = RuntimeError("not found")
  sut = AgentService(unit_of_work=mock_unit_of_work)

  with pytest.raises(RuntimeError, match="not found"):
    await sut.create_agent(request=AgentRequest(name="에이전트1", description="설명1", system_prompt="프롬프트1", tools=[tool_id]))

  mock_unit_of_work.commit.assert_not_called()


async def test_get_all_agents_레포지토리_get_all_함수를_호출한다(mock_unit_of_work: AsyncMock):
  sut = AgentService(unit_of_work=mock_unit_of_work)

  await sut.get_agents()

  mock_unit_of_work.agents.get_all.assert_awaited_once_with()
  mock_unit_of_work.commit.assert_not_called()


async def test_get_all_agents_레포지토리를_통해_에이전트_리스트를_조회한다(mock_unit_of_work: AsyncMock):
  expected_id_1 = uuid.uuid4()
  expected_id_2 = uuid.uuid4()
  tool_id = str(uuid.uuid4())
  mock_unit_of_work.agents.get_all.return_value = [
    make_agent_entity(1, expected_id_1, [tool_id]),
    make_agent_entity(2, expected_id_2, []),
  ]
  sut = AgentService(unit_of_work=mock_unit_of_work)

  result = await sut.get_agents()

  assert len(result) == 2
  assert result[0].id == expected_id_1
  assert result[0].name == "에이전트1"
  assert result[0].description == "설명1"
  assert result[0].system_prompt == "프롬프트1"
  assert result[0].tools == [tool_id]
  assert result[1].id == expected_id_2
  assert result[1].name == "에이전트2"
  assert result[1].description == "설명2"
  assert result[1].system_prompt == "프롬프트2"
  assert result[1].tools == []


async def test_update_agent_레포지토리_update_함수를_호출한다(mock_unit_of_work: AsyncMock):
  expected_id = uuid.uuid4()
  tool_id = str(uuid.uuid4())
  mock_unit_of_work.agents.update.return_value = make_agent_entity(1, expected_id, [tool_id])
  sut = AgentService(unit_of_work=mock_unit_of_work)

  await sut.update_agent(
    agent_id=expected_id,
    request=AgentRequest(name="에이전트1", description="설명1", system_prompt="프롬프트1", tools=[tool_id]),
  )

  mock_unit_of_work.agents.update.assert_awaited_once()
  _, kwargs = mock_unit_of_work.agents.update.call_args
  assert kwargs["agent_id"] == expected_id
  assert kwargs["model"].name == "에이전트1"
  assert kwargs["model"].description == "설명1"
  assert kwargs["model"].system_prompt == "프롬프트1"
  assert kwargs["tool_ids"] == [tool_id]
  mock_unit_of_work.commit.assert_awaited_once_with()


async def test_update_agent_레포지토리를_통해_정보를_업데이트_후_반환한다(mock_unit_of_work: AsyncMock):
  expected_id = uuid.uuid4()
  tool_id = str(uuid.uuid4())
  mock_unit_of_work.agents.update.return_value = make_agent_entity(1, expected_id, [tool_id])
  sut = AgentService(unit_of_work=mock_unit_of_work)

  result = await sut.update_agent(
    agent_id=expected_id,
    request=AgentRequest(name="에이전트1", description="설명1", system_prompt="프롬프트1", tools=[tool_id]),
  )

  assert result.id == expected_id
  assert result.name == "에이전트1"
  assert result.description == "설명1"
  assert result.system_prompt == "프롬프트1"
  assert result.tools == [tool_id]


async def test_update_agent_중복된_도구_아이디를_제거한다(mock_unit_of_work: AsyncMock):
  expected_id = uuid.uuid4()
  tool_id = str(uuid.uuid4())
  mock_unit_of_work.agents.update.return_value = make_agent_entity(1, expected_id, [tool_id])
  sut = AgentService(unit_of_work=mock_unit_of_work)

  await sut.update_agent(
    agent_id=expected_id,
    request=AgentRequest(name="에이전트1", description="설명1", system_prompt="프롬프트1", tools=[tool_id, tool_id]),
  )

  _, kwargs = mock_unit_of_work.agents.update.call_args
  assert kwargs["tool_ids"] == [tool_id]


async def test_delete_agent_레포지토리_delete_함수를_호출한다(mock_unit_of_work: AsyncMock):
  expected_id = uuid.uuid4()
  sut = AgentService(unit_of_work=mock_unit_of_work)

  await sut.delete_agent(agent_id=expected_id)

  mock_unit_of_work.agents.delete.assert_awaited_once_with(agent_id=expected_id)
  mock_unit_of_work.commit.assert_awaited_once_with()


async def test_exists_agent_by_name_레포지토리_exists_by_name_함수를_호출한다(mock_unit_of_work: AsyncMock):
  mock_unit_of_work.agents.exists_by_name.return_value = True
  sut = AgentService(unit_of_work=mock_unit_of_work)

  await sut.exists_agent_by_name(name="에이전트1")

  mock_unit_of_work.agents.exists_by_name.assert_awaited_once_with(name="에이전트1")
  mock_unit_of_work.commit.assert_not_called()


async def test_exists_agent_by_name_레포지토리를_통해_에이전트_존재여부를_반환한다(mock_unit_of_work: AsyncMock):
  mock_unit_of_work.agents.exists_by_name.return_value = True
  sut = AgentService(unit_of_work=mock_unit_of_work)

  result = await sut.exists_agent_by_name(name="에이전트1")

  assert result is True
