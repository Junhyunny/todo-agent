import uuid

import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from entities.todo_entities import TodoEntity, TodoStatus
from repositories.todo_repository import TodoRepository


async def test_create_todo_정보를_저장할_수_있다(setup_test_db: AsyncSession):
  session = setup_test_db
  sut = TodoRepository(session=session)

  result = await sut.create(TodoEntity(title="할 일 제목", content="할 일 내용", status=TodoStatus.PENDING.value))

  assert result.id is not None
  assert result.title == "할 일 제목"
  assert result.content == "할 일 내용"
  assert result.status == TodoStatus.PENDING


async def test_get_all_저장된_todo_목록을_조회할_수_있다(setup_test_db: AsyncSession):
  session = setup_test_db
  session.add(TodoEntity(id=str(uuid.uuid4()), title="할 일1", content="내용1", status=TodoStatus.PENDING.value))
  session.add(TodoEntity(id=str(uuid.uuid4()), title="할 일2", content="내용2", status=TodoStatus.PENDING.value))
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


@pytest.mark.parametrize("status", ["pending", "assigned", "done"])
async def test_create_todo_다양한_상태로_저장할_수_있다(setup_test_db: AsyncSession, status: str):
  session = setup_test_db
  sut = TodoRepository(session=session)

  result = await sut.create(TodoEntity(title="할 일", content="내용", status=status))

  assert result.status == status


async def test_find_by_id_todo를_조회할_수_있다(setup_test_db: AsyncSession):
  session = setup_test_db
  todo_id = str(uuid.uuid4())
  session.add(TodoEntity(id=todo_id, title="할 일", content="내용", status=TodoStatus.PENDING.value))
  await session.commit()
  sut = TodoRepository(session=session)

  result = await sut.find_by_id(uuid.UUID(todo_id))

  assert result is not None
  assert result.id == todo_id
  assert result.title == "할 일"
  assert result.content == "내용"
  assert result.status == TodoStatus.PENDING.value


async def test_find_by_id_존재하지_않으면_None을_반환한다(setup_test_db: AsyncSession):
  session = setup_test_db
  sut = TodoRepository(session=session)

  result = await sut.find_by_id(uuid.uuid4())

  assert result is None


async def test_assign_agent_에이전트를_할당하고_상태를_변경한다(setup_test_db: AsyncSession):
  session = setup_test_db
  todo_id = str(uuid.uuid4())
  session.add(TodoEntity(id=todo_id, title="할 일", content="내용", status=TodoStatus.PENDING.value))
  await session.commit()
  sut = TodoRepository(session=session)

  result = await sut.assign_agent(uuid.UUID(todo_id), "검색 에이전트")

  assert result.assigned_agent_name == "검색 에이전트"
  assert result.status == TodoStatus.ASSIGNED


async def test_assign_agent_존재하지_않는_todo이면_예외가_발생한다(setup_test_db: AsyncSession):
  session = setup_test_db
  sut = TodoRepository(session=session)

  with pytest.raises(RuntimeError):
    await sut.assign_agent(uuid.uuid4(), "검색 에이전트")


async def test_complete_todo_상태를_completed로_변경하고_결과를_저장한다(setup_test_db: AsyncSession) -> None:
  session = setup_test_db
  todo_id = str(uuid.uuid4())
  session.add(TodoEntity(id=todo_id, title="할 일", content="내용", status="in_progress", assigned_agent_name="검색 에이전트"))
  await session.commit()
  sut = TodoRepository(session=session)

  await sut.complete_todo(uuid.UUID(todo_id), result="작업 결과")

  result = await sut.find_by_id(uuid.UUID(todo_id))
  assert result is not None
  assert result.status == TodoStatus.COMPLETED
  assert result.result == "작업 결과"


async def test_complete_todo_존재하지_않는_todo이면_예외가_발생한다(setup_test_db: AsyncSession) -> None:
  session = setup_test_db
  sut = TodoRepository(session=session)

  with pytest.raises(RuntimeError):
    await sut.complete_todo(uuid.uuid4(), result="작업 결과")


async def test_delete_todo_정보를_삭제할_수_있다(setup_test_db: AsyncSession) -> None:
  session = setup_test_db
  todo_id = str(uuid.uuid4())
  session.add(TodoEntity(id=todo_id, title="할 일", content="내용", status=TodoStatus.PENDING.value))
  await session.commit()
  sut = TodoRepository(session=session)

  await sut.delete(todo_id=uuid.UUID(todo_id))

  result = await session.execute(select(TodoEntity).where(TodoEntity.id == todo_id))
  assert result.scalar_one_or_none() is None


async def test_delete_todo_존재하지_않는_todo이면_예외가_발생한다(setup_test_db: AsyncSession) -> None:
  session = setup_test_db
  sut = TodoRepository(session=session)

  with pytest.raises(RuntimeError):
    await sut.delete(todo_id=uuid.uuid4())


async def test_fail_todo_상태를_failed로_변경한다(setup_test_db: AsyncSession) -> None:
  session = setup_test_db
  todo_id = str(uuid.uuid4())
  session.add(TodoEntity(id=todo_id, title="할 일", content="내용", status=TodoStatus.PENDING.value))
  await session.commit()
  sut = TodoRepository(session=session)

  await sut.fail_todo(uuid.UUID(todo_id))

  result = await sut.find_by_id(uuid.UUID(todo_id))
  assert result is not None
  assert result.status == TodoStatus.FAILED


async def test_fail_todo_존재하지_않는_todo이면_예외가_발생한다(setup_test_db: AsyncSession) -> None:
  session = setup_test_db
  sut = TodoRepository(session=session)

  with pytest.raises(RuntimeError):
    await sut.fail_todo(uuid.uuid4())
