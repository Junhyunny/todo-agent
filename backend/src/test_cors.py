from unittest.mock import AsyncMock

import pytest
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from httpx import ASGITransport, AsyncClient

from routers.todo_router import router as todo_router
from services.todo_service import TodoService


@pytest.fixture
def cors_app():
  app = FastAPI()
  app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
  )
  mock_service = AsyncMock(spec=TodoService)
  mock_service.get_todos.return_value = []
  app.include_router(todo_router)
  app.dependency_overrides[TodoService] = lambda: mock_service
  return app


async def test_CORS_허용된_origin에서_요청시_CORS_헤더를_반환한다(cors_app):
  async with AsyncClient(transport=ASGITransport(cors_app), base_url="http://test") as client:
    response = await client.get("/api/todos", headers={"Origin": "http://localhost:5173"})

  assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"


async def test_CORS_허용되지_않은_origin은_CORS_헤더를_포함하지_않는다(cors_app):
  async with AsyncClient(transport=ASGITransport(cors_app), base_url="http://test") as client:
    response = await client.get("/api/todos", headers={"Origin": "http://evil.com"})

  assert "access-control-allow-origin" not in response.headers
