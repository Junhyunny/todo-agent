import uuid
from unittest.mock import AsyncMock

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from routers.tool_router import router
from schemas.tool_api_schema import ToolResponse
from services.tool_service import ToolService


@pytest.fixture
def app():
  app = FastAPI()
  app.include_router(router)
  return app


@pytest.fixture
def mock_tool_service():
  return AsyncMock(spec=ToolService)


@pytest.fixture
async def mock_async_client(app, mock_tool_service):
  app.dependency_overrides[ToolService] = lambda: mock_tool_service
  async with AsyncClient(transport=ASGITransport(app), base_url="http://test") as client:
    yield client
  app.dependency_overrides.clear()


async def test_GET_tools_툴_리스트를_반환한다(mock_async_client, mock_tool_service: AsyncMock):
  expected_id_1 = uuid.uuid4()
  expected_id_2 = uuid.uuid4()
  mock_tool_service.get_tools.return_value = [
    ToolResponse(id=expected_id_1, name="툴 1"),
    ToolResponse(id=expected_id_2, name="툴 2"),
  ]

  response = await mock_async_client.get("/api/tools")

  assert response.status_code == 200
  body = response.json()
  assert len(body) == 2
  assert body[0]["id"] == str(expected_id_1)
  assert body[0]["name"] == "툴 1"
  assert body[1]["id"] == str(expected_id_2)
  assert body[1]["name"] == "툴 2"


async def test_GET_tools_서비스_get_tools를_호출한다(mock_async_client, mock_tool_service: AsyncMock):
  mock_tool_service.get_tools.return_value = []

  await mock_async_client.get("/api/tools")

  mock_tool_service.get_tools.assert_called_once()
