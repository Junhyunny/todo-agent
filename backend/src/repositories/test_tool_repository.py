import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from entities import ToolEntity
from repositories.tool_repository import ToolRepository


async def test_get_all_데이터가_없는_경우_빈_리스트를_반환한다(setup_test_db: AsyncSession):
  repository = ToolRepository(session=setup_test_db)

  result = await repository.get_all()

  assert result == []


async def test_get_all_툴_리스트를_조회할_수_있다(setup_test_db: AsyncSession):
  session = setup_test_db
  expected_id_1 = str(uuid.uuid4())
  expected_id_2 = str(uuid.uuid4())
  session.add(ToolEntity(id=expected_id_1, name="툴 1"))
  session.add(ToolEntity(id=expected_id_2, name="툴 2"))
  await session.commit()

  repository = ToolRepository(session=setup_test_db)
  result = await repository.get_all()

  assert len(result) == 2
  assert result[0].id == expected_id_1
  assert result[0].name == "툴 1"
  assert result[1].id == expected_id_2
  assert result[1].name == "툴 2"
