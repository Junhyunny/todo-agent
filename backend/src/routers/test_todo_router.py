import uuid
from unittest.mock import AsyncMock

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from routers.todo_router import router
from schemas.todo_api_schema import TodoResponse
from services.todo_service import TodoService


@pytest.fixture
def app():
  app = FastAPI()
  app.include_router(router)
  return app


@pytest.fixture
def mock_todo_service():
  return AsyncMock(spec=TodoService)


@pytest.fixture
async def mock_async_client(app, mock_todo_service):
  app.dependency_overrides[TodoService] = lambda: mock_todo_service
  async with AsyncClient(transport=ASGITransport(app), base_url="http://test") as client:
    yield client
  app.dependency_overrides.clear()


async def test_POST_todos_todo를_저장하고_반환한다(mock_async_client, mock_todo_service: AsyncMock):
  expected_id = uuid.uuid4()
  mock_todo_service.create_todo.return_value = TodoResponse(
    id=expected_id, title="할 일", content="내용", status="completed", assigned_agent_name="에이전트1", result="작업 결과"
  )

  response = await mock_async_client.post("/api/todos", json={"title": "할 일", "content": "내용"})

  assert response.status_code == 201
  body = response.json()
  assert body["id"] == str(expected_id)
  assert body["title"] == "할 일"
  assert body["content"] == "내용"
  assert body["status"] == "completed"
  assert body["assigned_agent_name"] == "에이전트1"
  assert body["result"] == "작업 결과"


async def test_POST_todos_todo를_저장할_때_서비스를_호출한다(mock_async_client, mock_todo_service: AsyncMock):
  expected_id = uuid.uuid4()
  mock_todo_service.create_todo.return_value = TodoResponse(id=expected_id, title="할 일", content="내용", status="pending")

  await mock_async_client.post("/api/todos", json={"title": "할 일", "content": "내용"})

  mock_todo_service.create_todo.assert_called_once()
  _, kwargs = mock_todo_service.create_todo.call_args
  assert kwargs["request"].title == "할 일"
  assert kwargs["request"].content == "내용"


async def test_GET_todos_todo_목록을_조회한다(mock_async_client, mock_todo_service: AsyncMock):
  id_1 = uuid.uuid4()
  id_2 = uuid.uuid4()
  mock_todo_service.get_todos.return_value = [
    TodoResponse(id=id_1, title="할 일1", content="내용1", status="pending"),
    TodoResponse(id=id_2, title="할 일2", content="내용2", status="pending"),
  ]

  response = await mock_async_client.get("/api/todos")

  assert response.status_code == 200
  body = response.json()
  assert len(body) == 2
  assert body[0]["id"] == str(id_1)
  assert body[0]["title"] == "할 일1"
  assert body[1]["id"] == str(id_2)
  assert body[1]["title"] == "할 일2"


async def test_DELETE_todos_todo를_삭제할_때_서비스를_호출한다(mock_async_client, mock_todo_service: AsyncMock) -> None:
  expected_id = uuid.uuid4()
  mock_todo_service.delete_todo.return_value = None

  await mock_async_client.delete(f"/api/todos/{expected_id}")

  mock_todo_service.delete_todo.assert_called_once()
  _, kwargs = mock_todo_service.delete_todo.call_args
  assert kwargs["todo_id"] == expected_id


async def test_DELETE_todos_todo를_삭제하고_204를_반환한다(mock_async_client, mock_todo_service: AsyncMock) -> None:
  mock_todo_service.delete_todo.return_value = None

  response = await mock_async_client.delete(f"/api/todos/{uuid.uuid4()}")

  assert response.status_code == 204


async def test_GET_todos_todo_목록을_조회할_때_서비스를_호출한다(mock_async_client, mock_todo_service: AsyncMock):
  mock_todo_service.get_todos.return_value = []

  await mock_async_client.get("/api/todos")

  mock_todo_service.get_todos.assert_called_once()


async def test_POST_todos_todo_id_reassign_서비스를_호출한다(mock_async_client, mock_todo_service: AsyncMock) -> None:
  expected_id = uuid.uuid4()
  mock_todo_service.reassign_todo.return_value = None

  await mock_async_client.post(f"/api/todos/{expected_id}/reassign")

  mock_todo_service.reassign_todo.assert_called_once()
  _, kwargs = mock_todo_service.reassign_todo.call_args
  assert kwargs["todo_id"] == expected_id


async def test_POST_todos_todo_id_reassign_204를_반환한다(mock_async_client, mock_todo_service: AsyncMock) -> None:
  mock_todo_service.reassign_todo.return_value = None

  response = await mock_async_client.post(f"/api/todos/{uuid.uuid4()}/reassign")

  assert response.status_code == 204
