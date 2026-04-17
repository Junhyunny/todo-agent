import uuid
from unittest.mock import AsyncMock

import pytest

from models.todo_api_schema import PostTodoRequest
from models.todo_models import TodoModel
from repositories.todo_repository import TodoRepository
from services.todo_service import TodoService


@pytest.fixture
def mock_todo_repository():
  return AsyncMock(spec=TodoRepository)


async def test_create_todo_레포지토리_create_함수를_호출한다(mock_todo_repository: AsyncMock):
  expected_id = uuid.uuid4()
  mock_todo_repository.create.return_value = TodoModel(id=str(expected_id), title="할 일", content="내용", status="pending")
  sut = TodoService(todo_repository=mock_todo_repository)

  await sut.create_todo(request=PostTodoRequest(title="할 일", content="내용"))

  mock_todo_repository.create.assert_called_once()
  _, kwargs = mock_todo_repository.create.call_args
  assert kwargs["model"].title == "할 일"
  assert kwargs["model"].content == "내용"
  assert kwargs["model"].status == "pending"


async def test_create_todo_생성된_todo를_반환한다(mock_todo_repository: AsyncMock):
  expected_id = uuid.uuid4()
  mock_todo_repository.create.return_value = TodoModel(id=str(expected_id), title="할 일", content="내용", status="pending")
  sut = TodoService(todo_repository=mock_todo_repository)

  result = await sut.create_todo(request=PostTodoRequest(title="할 일", content="내용"))

  assert result.id == expected_id
  assert result.title == "할 일"
  assert result.content == "내용"
  assert result.status == "pending"


async def test_get_todos_레포지토리_get_all_함수를_호출한다(mock_todo_repository: AsyncMock):
  mock_todo_repository.get_all.return_value = []
  sut = TodoService(todo_repository=mock_todo_repository)

  await sut.get_todos()

  mock_todo_repository.get_all.assert_called_once()


async def test_get_todos_todo_목록을_반환한다(mock_todo_repository: AsyncMock):
  id_1 = uuid.uuid4()
  id_2 = uuid.uuid4()
  mock_todo_repository.get_all.return_value = [
    TodoModel(id=str(id_1), title="할 일1", content="내용1", status="pending"),
    TodoModel(id=str(id_2), title="할 일2", content="내용2", status="pending"),
  ]
  sut = TodoService(todo_repository=mock_todo_repository)

  result = await sut.get_todos()

  assert len(result) == 2
  assert result[0].id == id_1
  assert result[0].title == "할 일1"
  assert result[1].id == id_2
  assert result[1].title == "할 일2"
