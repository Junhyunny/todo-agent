import uuid

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from models.todo_models import TodoModel
from repositories.todo_repository import TodoRepository


async def test_create_todo_정보를_저장할_수_있다(setup_test_db: AsyncSession):
  session = setup_test_db
  sut = TodoRepository(session=session)

  result = await sut.create(TodoModel(title="할 일 제목", content="할 일 내용", status="pending"))

  assert result.id is not None
  assert result.title == "할 일 제목"
  assert result.content == "할 일 내용"
  assert result.status == "pending"


async def test_get_all_저장된_todo_목록을_조회할_수_있다(setup_test_db: AsyncSession):
  session = setup_test_db
  session.add(TodoModel(id=str(uuid.uuid4()), title="할 일1", content="내용1", status="pending"))
  session.add(TodoModel(id=str(uuid.uuid4()), title="할 일2", content="내용2", status="pending"))
  await session.commit()
  sut = TodoRepository(session=session)

  result = await sut.get_all()

  assert len(result) == 2
  assert result[0].title == "할 일1"
  assert result[1].title == "할 일2"


async def test_get_all_저장된_todo가_없으면_빈_목록을_반환한다(setup_test_db: AsyncSession):
  session = setup_test_db
  sut = TodoRepository(session=session)

  result = await sut.get_all()

  assert len(result) == 0


@pytest.mark.parametrize("status", ["pending", "in_progress", "done"])
async def test_create_todo_다양한_상태로_저장할_수_있다(setup_test_db: AsyncSession, status: str):
  session = setup_test_db
  sut = TodoRepository(session=session)

  result = await sut.create(TodoModel(title="할 일", content="내용", status=status))

  assert result.status == status
