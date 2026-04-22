from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from agents.task_agent import TaskAgent


@pytest.fixture
def mock_llm() -> AsyncMock:
  return AsyncMock()


@patch("agents.task_agent.get_llm")
async def test_task_agent_LLM에게_system_prompt와_user_message를_전달한다(mock_get_llm: MagicMock, mock_llm: AsyncMock) -> None:
  mock_get_llm.return_value = mock_llm
  mock_llm.ainvoke.return_value = MagicMock(content="처리 완료")
  sut = TaskAgent()

  await sut.ainvoke(system_prompt="검색 담당 에이전트", user_message="이메일을 정리해줘")

  mock_llm.ainvoke.assert_called_once_with(
    [
      {"role": "system", "content": "검색 담당 에이전트"},
      {"role": "user", "content": "이메일을 정리해줘"},
    ]
  )


@patch("agents.task_agent.get_llm")
async def test_task_agent_LLM_응답을_반환한다(mock_get_llm: MagicMock, mock_llm: AsyncMock) -> None:
  mock_get_llm.return_value = mock_llm
  mock_llm.ainvoke.return_value = MagicMock(content="처리 완료")
  sut = TaskAgent()

  result = await sut.ainvoke(system_prompt="검색 담당 에이전트", user_message="이메일을 정리해줘")

  assert result == "처리 완료"
