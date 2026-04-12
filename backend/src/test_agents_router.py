import pytest
from httpx import ASGITransport, AsyncClient

from app import app


@pytest.mark.asyncio
async def test_POST_agents_에이전트를_저장하고_반환한다():
  async with AsyncClient(
    transport=ASGITransport(app=app), base_url="http://test"
  ) as client:
    response = await client.post(
      "/agents",
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
      "/agents",
      json={"name": "에이전트1", "system_prompt": "프롬프트1"},
    )
    second_response = await client.post(
      "/agents",
      json={"name": "에이전트2", "system_prompt": "프롬프트2"},
    )

  assert first_response.status_code == 201
  assert second_response.status_code == 201
  assert first_response.json()["id"] != second_response.json()["id"]


@pytest.mark.asyncio
async def test_POST_agents_DB에_에이전트가_저장된다(setup_test_db):
  from sqlalchemy import select

  from models import AgentModel

  session_factory = setup_test_db

  async with AsyncClient(
    transport=ASGITransport(app=app), base_url="http://test"
  ) as client:
    response = await client.post(
      "/agents",
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
