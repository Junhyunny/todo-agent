import json
from unittest.mock import AsyncMock, patch

import pytest

from agents.orchestration_agent import OrchestrationAgent
from models.llm_models import OrchestrationAgentMessage, TargetAgent


@pytest.fixture
def mock_agent():
  return AsyncMock()


@patch("agents.orchestration_agent.create_agent")
async def test_orchestration_agent_에이전트에게_프롬프트를_전달한다(mock_create_agent, mock_agent):
  mock_create_agent.return_value = mock_agent
  mock_agent.ainvoke.return_value = {
    "structured_response": OrchestrationAgentMessage(
      result=TargetAgent(name="검색 에이전트", system_prompt="웹 검색 담당"), is_applicable=True, reason="할일 관련 요청"
    )
  }
  sut = OrchestrationAgent()
  user_message = json.dumps(
    {"TODO 정보": {"제목": "이메일 검색", "내용": "안 읽은 이메일을 정리해줘"}, "사용 가능한 에이전트": [{"검색 에이전트": "웹 검색 담당"}]}
  )

  await sut.ainvoke(user_message)

  mock_agent.ainvoke.assert_called_once_with({"messages": [{"role": "user", "content": user_message}]})


@patch("agents.orchestration_agent.create_agent")
async def test_orchestration_agent_일을_위임할_타겟_에이전트를_찾는다(mock_create_agent, mock_agent):
  mock_create_agent.return_value = mock_agent
  mock_agent.ainvoke.return_value = {
    "structured_response": OrchestrationAgentMessage(
      result=TargetAgent(name="검색 에이전트", system_prompt="웹 검색 담당"), is_applicable=True, reason="할일 관련 요청"
    )
  }
  sut = OrchestrationAgent()

  agent, reason = await sut.ainvoke(
    json.dumps(
      {"TODO 정보": {"제목": "이메일 검색", "내용": "안 읽은 이메일을 정리해줘"}, "사용 가능한 에이전트": [{"검색 에이전트": "웹 검색 담당"}]}
    )
  )

  assert agent is not None
  assert agent.name == "검색 에이전트"
  assert agent.system_prompt == "웹 검색 담당"
  assert reason == "할일 관련 요청"


@patch("agents.orchestration_agent.create_agent")
async def test_orchestration_agent_일을_위임할_타겟_에이전트를_찾지_못하면_None을_반환한다(mock_create_agent, mock_agent):
  mock_create_agent.return_value = mock_agent
  mock_agent.ainvoke.return_value = {
    "structured_response": OrchestrationAgentMessage(result=None, is_applicable=False, reason="제공된 에이전트로는 할 일을 처리할 수 없음")
  }
  sut = OrchestrationAgent()

  agent, reason = await sut.ainvoke(
    json.dumps(
      {"TODO 정보": {"제목": "이메일 검색", "내용": "안 읽은 이메일을 정리해줘"}, "사용 가능한 에이전트": [{"검색 에이전트": "웹 검색 담당"}]}
    )
  )

  assert agent is None
  assert reason == "제공된 에이전트로는 할 일을 처리할 수 없음"
