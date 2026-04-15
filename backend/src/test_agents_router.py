import pytest
from httpx import ASGITransport, AsyncClient

from app import app


@pytest.mark.asyncio
async def test_POST_agents_에이전트를_저장하고_반환한다():
  async with AsyncClient(
    transport=ASGITransport(app=app), base_url="http://test"
  ) as client:
    response = await client.post(
      "/api/agents",
      json={"name": "테스트 에이전트", "system_prompt": "너는 AI야"},
    )

  assert response.status_code == 201
  body = response.json()
  assert body["name"] == "테스트 에이전트"
  assert body["system_prompt"] == "너는 AI야"
  assert "id" in body


@pytest.mark.asyncio
async def test_POST_agents_여러번_호출하면_서로_다른_ID를_반환한다():
  async with AsyncClient(
    transport=ASGITransport(app=app), base_url="http://test"
  ) as client:
    first_response = await client.post(
      "/api/agents",
      json={"name": "에이전트1", "system_prompt": "프롬프트1"},
    )
    second_response = await client.post(
      "/api/agents",
      json={"name": "에이전트2", "system_prompt": "프롬프트2"},
    )

  assert first_response.status_code == 201
  assert second_response.status_code == 201
  assert first_response.json()["id"] != second_response.json()["id"]


@pytest.mark.asyncio
async def test_GET_agents_저장된_에이전트_목록을_반환한다(setup_test_db):
  from models import AgentModel
  session_factory = setup_test_db
  async with session_factory() as session:
    session.add(AgentModel(name="에이전트A", system_prompt="프롬프트A"))
    session.add(AgentModel(name="에이전트B", system_prompt="프롬프트B"))
    await session.commit()

  async with AsyncClient(
    transport=ASGITransport(app=app), base_url="http://test"
  ) as client:
    response = await client.get("/api/agents")

  assert response.status_code == 200
  body = response.json()
  print(body)
  assert isinstance(body, list)
  assert len(body) == 2
  assert all("id" in agent for agent in body)
  assert body[0]['name'] == "에이전트A"
  assert body[0]['system_prompt'] == "프롬프트A"
  assert body[1]['name'] == "에이전트B"
  assert body[1]['system_prompt'] == "프롬프트B"


@pytest.mark.asyncio
async def test_GET_agents_에이전트가_없으면_빈_배열을_반환한다():
  async with AsyncClient(
    transport=ASGITransport(app=app), base_url="http://test"
  ) as client:
    response = await client.get("/api/agents")

  assert response.status_code == 200
  assert response.json() == []


@pytest.mark.asyncio
async def test_POST_agents_DB에_에이전트가_저장된다(setup_test_db):
  from sqlalchemy import select

  from models import AgentModel

  session_factory = setup_test_db

  async with AsyncClient(
    transport=ASGITransport(app=app), base_url="http://test"
  ) as client:
    response = await client.post(
      "/api/agents",
      json={"name": "DB저장 에이전트", "system_prompt": "저장 테스트"},
    )

  assert response.status_code == 201
  agent_id = response.json()["id"]

  async with session_factory() as session:
    result = await session.execute(select(AgentModel).where(AgentModel.id == agent_id))
    agent = result.scalar_one_or_none()

  assert agent is not None
  assert agent.name == "DB저장 에이전트"
  assert agent.system_prompt == "저장 테스트"


@pytest.mark.asyncio
async def test_PUT_agents_에이전트를_수정하고_반환한다(setup_test_db):
  from models import AgentModel

  session_factory = setup_test_db
  async with session_factory() as session:
    agent = AgentModel(name="원래 이름", system_prompt="원래 프롬프트")
    session.add(agent)
    await session.commit()
    agent_id = agent.id

  async with AsyncClient(
    transport=ASGITransport(app=app), base_url="http://test"
  ) as client:
    response = await client.put(
      f"/api/agents/{agent_id}",
      json={"name": "수정된 이름", "system_prompt": "수정된 프롬프트"},
    )

  assert response.status_code == 200
  body = response.json()
  assert body["id"] == agent_id
  assert body["name"] == "수정된 이름"
  assert body["system_prompt"] == "수정된 프롬프트"


@pytest.mark.asyncio
async def test_PUT_agents_DB에_에이전트가_수정된다(setup_test_db):
  from sqlalchemy import select

  from models import AgentModel

  session_factory = setup_test_db
  async with session_factory() as session:
    agent = AgentModel(name="원래 이름", system_prompt="원래 프롬프트")
    session.add(agent)
    await session.commit()
    agent_id = agent.id

  async with AsyncClient(
    transport=ASGITransport(app=app), base_url="http://test"
  ) as client:
    await client.put(
      f"/api/agents/{agent_id}",
      json={"name": "수정된 이름", "system_prompt": "수정된 프롬프트"},
    )

  async with session_factory() as session:
    result = await session.execute(select(AgentModel).where(AgentModel.id == agent_id))
    agent = result.scalar_one()

  assert agent.name == "수정된 이름"
  assert agent.system_prompt == "수정된 프롬프트"
