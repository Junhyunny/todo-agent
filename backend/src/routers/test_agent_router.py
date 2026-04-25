import uuid
from unittest.mock import AsyncMock

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from routers.agent_router import router
from schemas.agent_api_schema import AgentResponse
from services.agent_service import AgentService


@pytest.fixture
def app():
  app = FastAPI()
  app.include_router(router)
  return app


@pytest.fixture
def mock_agent_service():
  return AsyncMock(
    spec=AgentService,
  )


@pytest.fixture
async def mock_async_client(app, mock_agent_service):
  app.dependency_overrides[AgentService] = lambda: mock_agent_service
  async with AsyncClient(transport=ASGITransport(app), base_url="http://test") as client:
    yield client
  app.dependency_overrides.clear()


async def test_POST_agents_에이전트를_저장하고_반환한다(mock_async_client, mock_agent_service: AsyncMock):
  expected_id = uuid.uuid4()
  tool_id = str(uuid.uuid4())
  mock_agent_service.create_agent.return_value = AgentResponse(
    id=expected_id, name="테스트 에이전트", description="설명", system_prompt="너는 AI야", tools=[tool_id]
  )

  response = await mock_async_client.post(
    "/api/agents",
    json={"name": "테스트 에이전트", "description": "설명", "system_prompt": "너는 AI야", "tools": [tool_id]},
  )

  assert response.status_code == 201
  body = response.json()
  assert body["name"] == "테스트 에이전트"
  assert body["description"] == "설명"
  assert body["system_prompt"] == "너는 AI야"
  assert body["tools"] == [tool_id]
  assert body["id"] == str(expected_id)


async def test_POST_agents_에이전트를_저장할_때_서비스를_호출한다(mock_async_client, mock_agent_service: AsyncMock):
  expected_id = uuid.uuid4()
  tool_id = str(uuid.uuid4())
  mock_agent_service.create_agent.return_value = AgentResponse(
    id=expected_id, name="테스트 에이전트", description="설명", system_prompt="너는 AI야", tools=[tool_id]
  )

  await mock_async_client.post("/api/agents", json={"name": "에이전트1", "description": "설명1", "system_prompt": "프롬프트1", "tools": [tool_id]})

  mock_agent_service.create_agent.assert_called_once()
  _, kwargs = mock_agent_service.create_agent.call_args
  assert kwargs["request"].name == "에이전트1"
  assert kwargs["request"].description == "설명1"
  assert kwargs["request"].system_prompt == "프롬프트1"
  assert kwargs["request"].tools == [tool_id]


async def test_GET_agents_에이전트_리스트를_조회한다(mock_async_client, mock_agent_service: AsyncMock):
  id_1 = uuid.uuid4()
  id_2 = uuid.uuid4()
  tool_id = str(uuid.uuid4())
  mock_agent_service.get_agents.return_value = list(
    [
      AgentResponse(id=id_1, name="테스트 에이전트1", description="설명1", system_prompt="너는 AI1야", tools=[tool_id]),
      AgentResponse(id=id_2, name="테스트 에이전트2", description="설명2", system_prompt="너는 AI2야", tools=[]),
    ]
  )

  response = await mock_async_client.get("/api/agents")

  assert response.status_code == 200
  body = response.json()
  assert len(body) == 2
  assert body[0]["id"] == str(id_1)
  assert body[0]["name"] == "테스트 에이전트1"
  assert body[0]["description"] == "설명1"
  assert body[0]["system_prompt"] == "너는 AI1야"
  assert body[0]["tools"] == [tool_id]
  assert body[1]["id"] == str(id_2)
  assert body[1]["name"] == "테스트 에이전트2"
  assert body[1]["description"] == "설명2"
  assert body[1]["system_prompt"] == "너는 AI2야"
  assert body[1]["tools"] == []


async def test_GET_agents_에이전트_리스트를_조회할_때_서비스를_호출한다(mock_async_client, mock_agent_service: AsyncMock):
  await mock_async_client.get("/api/agents")

  mock_agent_service.get_agents.assert_called_once()


async def test_PUT_agents_에이전트를_업데이트할_때_서비스를_호출한다(mock_async_client, mock_agent_service: AsyncMock):
  expected_id = uuid.uuid4()
  tool_id = str(uuid.uuid4())
  mock_agent_service.update_agent.return_value = AgentResponse(
    id=expected_id, name="테스트 에이전트", description="설명", system_prompt="너는 AI야", tools=[tool_id]
  )

  await mock_async_client.put(
    f"/api/agents/{expected_id}",
    json={"name": "에이전트1", "description": "설명1", "system_prompt": "프롬프트1", "tools": [tool_id]},
  )

  mock_agent_service.update_agent.assert_called_once()
  _, kwargs = mock_agent_service.update_agent.call_args
  assert kwargs["agent_id"] == expected_id
  assert kwargs["request"].name == "에이전트1"
  assert kwargs["request"].description == "설명1"
  assert kwargs["request"].system_prompt == "프롬프트1"
  assert kwargs["request"].tools == [tool_id]


async def test_PUT_agents_에이전트를_업데이트한다(mock_async_client, mock_agent_service: AsyncMock):
  expected_id = uuid.uuid4()
  tool_id = str(uuid.uuid4())
  mock_agent_service.update_agent.return_value = AgentResponse(
    id=expected_id, name="테스트 에이전트", description="설명", system_prompt="너는 AI야", tools=[tool_id]
  )

  response = await mock_async_client.put(
    f"/api/agents/{expected_id}",
    json={"name": "에이전트1", "description": "설명1", "system_prompt": "프롬프트1", "tools": [tool_id]},
  )

  assert response.status_code == 200
  body = response.json()
  assert body["id"] == str(expected_id)
  assert body["name"] == "테스트 에이전트"
  assert body["description"] == "설명"
  assert body["system_prompt"] == "너는 AI야"
  assert body["tools"] == [tool_id]


async def test_DELETE_agents_에이전트를_삭제할_때_서비스를_호출한다(mock_async_client, mock_agent_service: AsyncMock):
  expected_id = uuid.uuid4()
  mock_agent_service.delete_agent.return_value = None

  await mock_async_client.delete(f"/api/agents/{expected_id}")

  mock_agent_service.delete_agent.assert_called_once()
  _, kwargs = mock_agent_service.delete_agent.call_args
  assert kwargs["agent_id"] == expected_id


async def test_DELETE_agents_에이전트를_삭제한다(mock_async_client, mock_agent_service: AsyncMock):
  expected_id = uuid.uuid4()
  mock_agent_service.delete_agent.return_value = None

  response = await mock_async_client.delete(f"/api/agents/{expected_id}")

  assert response.status_code == 204


async def test_GET_agents_exists_이름이_존재하면_true를_반환한다(mock_async_client, mock_agent_service: AsyncMock):
  mock_agent_service.exists_agent_by_name.return_value = True

  response = await mock_async_client.get("/api/agents/exists?name=테스트 에이전트")

  assert response.status_code == 200
  assert response.json() is True


async def test_GET_agents_exists_이름이_없으면_false를_반환한다(mock_async_client, mock_agent_service: AsyncMock):
  mock_agent_service.exists_agent_by_name.return_value = False

  response = await mock_async_client.get("/api/agents/exists?name=없는 에이전트")

  assert response.status_code == 200
  assert response.json() is False
