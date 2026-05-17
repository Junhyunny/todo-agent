import uuid
from unittest.mock import AsyncMock

import pytest

from entities.todo_entities import TodoEntity
from pubs.assignment_publisher import AssignmentPublisher
from repositories.todo_repository import TodoRepository
from repositories.unit_of_work import AbstractUnitOfWork
from schemas.todo_api_schema import PostTodoRequest
from services.todo_service import TodoService


@pytest.fixture
def mock_todo_repository():
  return AsyncMock(spec=TodoRepository)


@pytest.fixture
def mock_publisher():
  return AsyncMock(spec=AssignmentPublisher)


@pytest.fixture
def mock_unit_of_work(mock_todo_repository: AsyncMock) -> AsyncMock:
  unit_of_work = AsyncMock(spec=AbstractUnitOfWork)
  unit_of_work.todos = mock_todo_repository
  unit_of_work.__aenter__.return_value = unit_of_work
  return unit_of_work


async def test_create_todo_레포지토리_create_함수를_호출한다(mock_unit_of_work: AsyncMock, mock_publisher: AsyncMock) -> None:
  expected_id = uuid.uuid4()
  mock_unit_of_work.todos.create.return_value = TodoEntity(id=str(expected_id), title="할 일", content="내용", status="pending")
  sut = TodoService(unit_of_work=mock_unit_of_work, publisher=mock_publisher)

  await sut.create_todo(request=PostTodoRequest(title="할 일", content="내용"))

  mock_unit_of_work.todos.create.assert_awaited_once()
  _, kwargs = mock_unit_of_work.todos.create.call_args
  assert kwargs["model"].title == "할 일"
  assert kwargs["model"].content == "내용"
  assert kwargs["model"].status == "pending"


async def test_create_todo_작업_단위를_commit한다(mock_unit_of_work: AsyncMock, mock_publisher: AsyncMock) -> None:
  expected_id = uuid.uuid4()
  mock_unit_of_work.todos.create.return_value = TodoEntity(id=str(expected_id), title="할 일", content="내용", status="pending")
  sut = TodoService(unit_of_work=mock_unit_of_work, publisher=mock_publisher)

  await sut.create_todo(request=PostTodoRequest(title="할 일", content="내용"))

  mock_unit_of_work.commit.assert_awaited_once_with()


async def test_create_todo_퍼블리셔_publish_함수를_호출한다(mock_unit_of_work: AsyncMock, mock_publisher: AsyncMock) -> None:
  expected_id = uuid.uuid4()
  mock_unit_of_work.todos.create.return_value = TodoEntity(id=str(expected_id), title="할 일", content="내용", status="pending")
  sut = TodoService(unit_of_work=mock_unit_of_work, publisher=mock_publisher)

  await sut.create_todo(request=PostTodoRequest(title="할 일", content="내용"))

  mock_publisher.publish.assert_awaited_once_with(str(expected_id))


async def test_create_todo_생성된_todo를_반환한다(mock_unit_of_work: AsyncMock, mock_publisher: AsyncMock) -> None:
  expected_id = uuid.uuid4()
  mock_unit_of_work.todos.create.return_value = TodoEntity(
    id=str(expected_id), title="할 일", content="내용", status="pending", assigned_agent_name=None, result=None
  )
  sut = TodoService(unit_of_work=mock_unit_of_work, publisher=mock_publisher)

  result = await sut.create_todo(request=PostTodoRequest(title="할 일", content="내용"))

  assert result.id == expected_id
  assert result.title == "할 일"
  assert result.content == "내용"
  assert result.status == "pending"
  assert result.assigned_agent_name is None
  assert result.result is None


async def test_create_todo_레포지토리에서_예외가_발생하면_commit과_publish를_호출하지_않는다(
  mock_unit_of_work: AsyncMock, mock_publisher: AsyncMock
) -> None:
  mock_unit_of_work.todos.create.side_effect = RuntimeError("not found")
  sut = TodoService(unit_of_work=mock_unit_of_work, publisher=mock_publisher)

  with pytest.raises(RuntimeError, match="not found"):
    await sut.create_todo(request=PostTodoRequest(title="할 일", content="내용"))

  mock_unit_of_work.commit.assert_not_called()
  mock_publisher.publish.assert_not_called()


async def test_get_todos_레포지토리_get_all_함수를_호출한다(mock_unit_of_work: AsyncMock, mock_publisher: AsyncMock) -> None:
  mock_unit_of_work.todos.get_all.return_value = []
  sut = TodoService(unit_of_work=mock_unit_of_work, publisher=mock_publisher)

  await sut.get_todos()

  mock_unit_of_work.todos.get_all.assert_awaited_once_with()
  mock_unit_of_work.commit.assert_not_called()


async def test_delete_todo_레포지토리_delete_함수를_호출한다(mock_unit_of_work: AsyncMock, mock_publisher: AsyncMock) -> None:
  expected_id = uuid.uuid4()
  sut = TodoService(unit_of_work=mock_unit_of_work, publisher=mock_publisher)

  await sut.delete_todo(todo_id=expected_id)

  mock_unit_of_work.todos.delete.assert_awaited_once_with(todo_id=expected_id)
  mock_unit_of_work.commit.assert_awaited_once_with()


async def test_reassign_todo_레포지토리_reset_to_pending_함수를_호출한다(mock_unit_of_work: AsyncMock, mock_publisher: AsyncMock) -> None:
  expected_id = uuid.uuid4()
  sut = TodoService(unit_of_work=mock_unit_of_work, publisher=mock_publisher)

  await sut.reassign_todo(todo_id=expected_id)

  mock_unit_of_work.todos.reset_to_pending.assert_awaited_once_with(todo_id=expected_id)
  mock_unit_of_work.commit.assert_awaited_once_with()


async def test_reassign_todo_퍼블리셔_publish_함수를_호출한다(mock_unit_of_work: AsyncMock, mock_publisher: AsyncMock) -> None:
  expected_id = uuid.uuid4()
  sut = TodoService(unit_of_work=mock_unit_of_work, publisher=mock_publisher)

  await sut.reassign_todo(todo_id=expected_id)

  mock_publisher.publish.assert_awaited_once_with(str(expected_id))


async def test_get_todos_todo_목록을_반환한다(mock_unit_of_work: AsyncMock, mock_publisher: AsyncMock) -> None:
  id_1 = uuid.uuid4()
  id_2 = uuid.uuid4()
  mock_unit_of_work.todos.get_all.return_value = [
    TodoEntity(id=str(id_1), title="할 일1", content="내용1", status="pending", assigned_agent_name=None),
    TodoEntity(id=str(id_2), title="할 일2", content="내용2", status="in_progress", assigned_agent_name="에이전트1", result="작업 결과"),
  ]
  sut = TodoService(unit_of_work=mock_unit_of_work, publisher=mock_publisher)

  result = await sut.get_todos()

  assert len(result) == 2
  assert result[0].id == id_1
  assert result[0].title == "할 일1"
  assert result[0].content == "내용1"
  assert result[0].status == "pending"
  assert result[0].assigned_agent_name is None
  assert result[0].result is None
  assert result[1].id == id_2
  assert result[1].title == "할 일2"
  assert result[1].content == "내용2"
  assert result[1].status == "in_progress"
  assert result[1].assigned_agent_name == "에이전트1"
  assert result[1].result == "작업 결과"
