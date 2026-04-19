import uuid

import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from entities import AgentEntity
from repositories.agent_repository import AgentRepository


async def test_create_에이전트_정보를_저장할_수_있다(setup_test_db: AsyncSession):
  repository = AgentRepository(session=setup_test_db)

  agent = AgentEntity(name="테스트 에이전트", system_prompt="테스트 프롬프트")
  created_agent = await repository.create(agent)

  assert created_agent.id is not None
  assert created_agent.name == "테스트 에이전트"
  assert created_agent.system_prompt == "테스트 프롬프트"


async def test_get_all_데이터가_없는_경우_빈_리스트를_반환한다(setup_test_db: AsyncSession):
  repository = AgentRepository(session=setup_test_db)

  result = await repository.get_all()

  assert result == []


async def test_get_all_에이전트_리스트를_조회할_수_있다(setup_test_db: AsyncSession):
  session = setup_test_db
  expected_id_1 = str(uuid.uuid4())
  expected_id_2 = str(uuid.uuid4())
  session.add(AgentEntity(id=expected_id_1, name="에이전트 1", system_prompt="프롬프트 1"))
  session.add(AgentEntity(id=expected_id_2, name="에이전트 2", system_prompt="프롬프트 2"))
  await session.commit()

  repository = AgentRepository(session=setup_test_db)
  result = await repository.get_all()

  assert len(result) == 2
  assert result[0].id == expected_id_1
  assert result[0].name == "에이전트 1"
  assert result[0].system_prompt == "프롬프트 1"
  assert result[1].id == expected_id_2
  assert result[1].name == "에이전트 2"
  assert result[1].system_prompt == "프롬프트 2"


async def test_update_에이전트_정보를_업데이트할_수_있다(setup_test_db: AsyncSession):
  expected_id = uuid.uuid4()
  session = setup_test_db
  session.add(AgentEntity(id=str(expected_id), name="업데이트 전 에이전트", system_prompt="업데이트 전 프롬프트"))

  sut = AgentRepository(session=setup_test_db)

  await sut.update(agent_id=expected_id, model=AgentEntity(name="업데이트 후 에이전트", system_prompt="업데이트 후 프롬프트"))

  query = select(AgentEntity).where(AgentEntity.id == str(expected_id))
  result = await session.execute(query)
  updated_agent: AgentEntity | None = result.scalar_one_or_none()
  assert updated_agent is not None
  assert updated_agent.id == str(expected_id)
  assert updated_agent.name == "업데이트 후 에이전트"
  assert updated_agent.system_prompt == "업데이트 후 프롬프트"


async def test_update_에이전트_정보가_없는_경우_예외가_발생한다(setup_test_db: AsyncSession):
  expected_id = uuid.uuid4()
  sut = AgentRepository(session=setup_test_db)

  with pytest.raises(RuntimeError, match="not found"):
    await sut.update(agent_id=expected_id, model=AgentEntity(name="업데이트 후 에이전트", system_prompt="업데이트 후 프롬프트"))


async def test_delete_에이전트_정보를_삭제할_수_있다(setup_test_db: AsyncSession):
  expected_id = uuid.uuid4()
  session = setup_test_db
  session.add(AgentEntity(id=str(expected_id), name="삭제 전 에이전트", system_prompt="삭제 전 프롬프트"))

  sut = AgentRepository(session=setup_test_db)

  await sut.delete(agent_id=expected_id)

  query = select(AgentEntity).where(AgentEntity.id == str(expected_id))
  result = await session.execute(query)
  deleted_agent = result.scalar_one_or_none()
  assert deleted_agent is None


@pytest.mark.parametrize(
  "query_name, expected",
  [
    ("존재하는 에이전트", True),
    ("없는 에이전트", False),
  ],
)
async def test_exists_by_name_에이전트_이름으로_존재여부를_확인할_수_있다(setup_test_db: AsyncSession, query_name: str, expected: bool):
  agent_id = uuid.uuid4()
  session = setup_test_db
  session.add(AgentEntity(id=str(agent_id), name="존재하는 에이전트", system_prompt="프롬프트"))

  sut = AgentRepository(session=session)

  result = await sut.exists_by_name(name=query_name)

  assert result is expected
