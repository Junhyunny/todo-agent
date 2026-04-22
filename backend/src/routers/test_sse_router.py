import asyncio
import json
from collections.abc import AsyncGenerator
from typing import Any
from unittest.mock import MagicMock

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from routers.sse_router import router
from sse.manager import SSEManager, get_sse_manager


@pytest.fixture
def mock_sse_manager() -> MagicMock:
  q: asyncio.Queue[dict[str, Any]] = asyncio.Queue()
  q.put_nowait({"type": "assigned", "agent_name": "검색 에이전트"})
  q.put_nowait({"type": "completed", "agent_name": "검색 에이전트"})
  manager = MagicMock(spec=SSEManager)
  manager.subscribe.return_value = q
  return manager


@pytest.fixture
def app(mock_sse_manager: MagicMock) -> FastAPI:
  app = FastAPI()
  app.include_router(router)
  app.dependency_overrides[get_sse_manager] = lambda: mock_sse_manager
  return app


@pytest.fixture
async def mock_async_client(app: FastAPI) -> AsyncGenerator[AsyncClient, None]:
  async with AsyncClient(transport=ASGITransport(app), base_url="http://test") as client:
    yield client
  app.dependency_overrides.clear()


async def test_GET_todos_events_SSE_매니저를_구독한다(mock_async_client: AsyncClient, mock_sse_manager: MagicMock) -> None:
  await mock_async_client.get("/api/todos/todo-1/events")

  mock_sse_manager.subscribe.assert_called_once_with("TODO_STATUS_CHANNEL_todo-1")


async def test_GET_todos_events_assigned와_completed_이벤트를_스트리밍한다(mock_async_client: AsyncClient) -> None:
  response = await mock_async_client.get("/api/todos/todo-1/events")

  assert response.status_code == 200
  assert "text/event-stream" in response.headers["content-type"]
  data_lines = [line for line in response.text.split("\n") if line.startswith("data:")]
  assert len(data_lines) == 2
  assigned_event = json.loads(data_lines[0].removeprefix("data: "))
  assert assigned_event["type"] == "assigned"
  completed_event = json.loads(data_lines[1].removeprefix("data: "))
  assert completed_event["type"] == "completed"


async def test_GET_todos_events_completed_이벤트_후_구독을_해제한다(mock_async_client: AsyncClient, mock_sse_manager: MagicMock) -> None:
  await mock_async_client.get("/api/todos/todo-1/events")

  mock_sse_manager.unsubscribe.assert_called_once_with("TODO_STATUS_CHANNEL_todo-1")
