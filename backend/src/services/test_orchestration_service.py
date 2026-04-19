import json
from unittest.mock import AsyncMock

from agents.orchestration_agent import OrchestrationAgent
from entities import TodoEntity
from entities.agent_entities import AgentEntity
from models.llm_models import TargetAgent
from services.orchestration_service import OrchestrationService

todo = TodoEntity(id="1", title="제목", content="내용", status="pending")
agents = [AgentEntity(id="1", name="검색 에이전트", system_prompt="웹 검색 담당")]


async def test_select_agent_OrchestrationAgent_ainvoke_함수를_호출한다():
  mock_agent = AsyncMock(spec=OrchestrationAgent)
  mock_agent.ainvoke.return_value = TargetAgent(name="검색 에이전트", system_prompt="웹 검색 담당")
  sut = OrchestrationService(agent=mock_agent)

  await sut.select_agent(todo, agents)

  mock_agent.ainvoke.assert_called_once_with(
    json.dumps({"TODO 정보": {"제목": "제목", "내용": "내용"}, "사용 가능한 에이전트": [{"검색 에이전트": "웹 검색 담당"}]})
  )


async def test_select_agent_일을_처리할_수_있는_에이전트를_반환한다():
  mock_agent = AsyncMock(spec=OrchestrationAgent)
  mock_agent.ainvoke.return_value = TargetAgent(name="검색 에이전트", system_prompt="웹 검색 담당")
  sut = OrchestrationService(agent=mock_agent)

  result = await sut.select_agent(todo, agents)

  assert result == "검색 에이전트"


async def test_select_agent_일을_처리할_수_있는_에이전트가_없는_경우_None_값을_반환한다():
  mock_agent = AsyncMock(spec=OrchestrationAgent)
  mock_agent.ainvoke.return_value = None
  sut = OrchestrationService(agent=mock_agent)

  result = await sut.select_agent(todo, agents)

  assert result is None
