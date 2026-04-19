import uuid
from unittest.mock import AsyncMock

import pytest

from entities import AgentEntity
from repositories.agent_repository import AgentRepository
from schemas.agent_api_schema import AgentRequest
from services.agent_service import AgentService


@pytest.fixture
def mock_agent_repository():
  return AsyncMock(spec=AgentRepository)


async def test_create_agent_레포지토리_create_함수를_호출한다(mock_agent_repository: AsyncMock):
  expected_id = uuid.uuid4()
  mock_agent_repository.create.return_value = AgentEntity(id=str(expected_id), name="에이전트1", system_prompt="프롬프트1")
  sut = AgentService(agent_repository=mock_agent_repository)

  await sut.create_agent(request=AgentRequest(name="에이전트1", system_prompt="프롬프트1"))

  mock_agent_repository.create.assert_called_once()
  _, kwargs = mock_agent_repository.create.call_args
  assert kwargs["model"].name == "에이전트1"
  assert kwargs["model"].system_prompt == "프롬프트1"


async def test_create_agent_레포지토리를_통해_정보를_저장_후_반환한다(mock_agent_repository):
  expected_id = uuid.uuid4()
  mock_agent_repository.create.return_value = AgentEntity(id=str(expected_id), name="에이전트1", system_prompt="프롬프트1")
  sut = AgentService(agent_repository=mock_agent_repository)

  result = await sut.create_agent(request=AgentRequest(name="에이전트1", system_prompt="프롬프트1"))

  assert result.id == expected_id
  assert result.name == "에이전트1"
  assert result.system_prompt == "프롬프트1"


async def test_get_all_agents_레포지토리_get_all_함수를_호출한다(mock_agent_repository: AsyncMock):
  sut = AgentService(agent_repository=mock_agent_repository)

  await sut.get_agents()

  mock_agent_repository.get_all.assert_called_once()


async def test_get_all_agents_레포지토리를_통해_에이전트_리스트를_조회한다(mock_agent_repository: AsyncMock):
  expected_id_1 = uuid.uuid4()
  expected_id_2 = uuid.uuid4()
  mock_agent_repository.get_all.return_value = [
    AgentEntity(id=str(expected_id_1), name="에이전트1", system_prompt="프롬프트1"),
    AgentEntity(id=str(expected_id_2), name="에이전트2", system_prompt="프롬프트2"),
  ]
  sut = AgentService(agent_repository=mock_agent_repository)

  result = await sut.get_agents()

  assert len(result) == 2
  assert result[0].id == expected_id_1
  assert result[0].name == "에이전트1"
  assert result[0].system_prompt == "프롬프트1"
  assert result[1].id == expected_id_2
  assert result[1].name == "에이전트2"
  assert result[1].system_prompt == "프롬프트2"


async def test_update_agent_레포지토리_update_함수를_호출한다(mock_agent_repository: AsyncMock):
  expected_id = uuid.uuid4()
  mock_agent_repository.update.return_value = AgentEntity(id=str(expected_id), name="에이전트1", system_prompt="프롬프트1")
  sut = AgentService(agent_repository=mock_agent_repository)

  await sut.update_agent(agent_id=expected_id, request=AgentRequest(name="에이전트1", system_prompt="프롬프트1"))

  mock_agent_repository.update.assert_called_once()
  _, kwargs = mock_agent_repository.update.call_args
  assert kwargs["agent_id"] == expected_id
  assert kwargs["model"].name == "에이전트1"
  assert kwargs["model"].system_prompt == "프롬프트1"


async def test_update_agent_레포지토리를_통해_정보를_업데이트_후_반환한다(mock_agent_repository: AsyncMock):
  expected_id = uuid.uuid4()
  mock_agent_repository.update.return_value = AgentEntity(id=str(expected_id), name="에이전트1", system_prompt="프롬프트1")
  sut = AgentService(agent_repository=mock_agent_repository)

  result = await sut.update_agent(agent_id=expected_id, request=AgentRequest(name="에이전트1", system_prompt="프롬프트1"))

  assert result.id == expected_id
  assert result.name == "에이전트1"
  assert result.system_prompt == "프롬프트1"


async def test_delete_agent_레포지토리_delete_함수를_호출한다(mock_agent_repository: AsyncMock):
  expected_id = uuid.uuid4()
  sut = AgentService(agent_repository=mock_agent_repository)

  await sut.delete_agent(agent_id=expected_id)

  mock_agent_repository.delete.assert_called_once()
  _, kwargs = mock_agent_repository.delete.call_args
  assert kwargs["agent_id"] == expected_id


async def test_exists_agent_by_name_레포지토리_exists_by_name_함수를_호출한다(mock_agent_repository: AsyncMock):
  mock_agent_repository.exists_by_name.return_value = True
  sut = AgentService(agent_repository=mock_agent_repository)

  await sut.exists_agent_by_name(name="에이전트1")

  mock_agent_repository.exists_by_name.assert_called_once()
  _, kwargs = mock_agent_repository.exists_by_name.call_args
  assert kwargs["name"] == "에이전트1"


async def test_exists_agent_by_name_레포지토리를_통해_에이전트_존재여부를_반환한다(mock_agent_repository: AsyncMock):
  mock_agent_repository.exists_by_name.return_value = True
  sut = AgentService(agent_repository=mock_agent_repository)

  result = await sut.exists_agent_by_name(name="에이전트1")

  assert result is True
