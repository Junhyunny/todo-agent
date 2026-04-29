from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from langchain.agents.structured_output import ToolStrategy

from agents.task_agent import TaskAgent
from models.llm_models import TaskAgentResult
from models.tool_codes import ToolCode


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


class FakeToolContext:
  def __init__(self, tools: list[MagicMock]) -> None:
    self.tools = tools

  async def __aenter__(self) -> list[MagicMock]:
    return self.tools

  async def __aexit__(self, exc_type: object, exc_value: object, traceback: object) -> None:
    return None


@patch("agents.task_agent.create_agent")
@patch("agents.task_agent.ToolFactory")
@patch("agents.task_agent.get_llm")
async def test_task_agent_도구_코드가_있으면_create_agent에_도구를_설정한다(
  mock_get_llm: MagicMock,
  mock_tool_factory_cls: MagicMock,
  mock_create_agent: MagicMock,
  mock_llm: AsyncMock,
) -> None:
  browser_tool = MagicMock()
  mock_get_llm.return_value = mock_llm
  mock_tool_factory = MagicMock()
  mock_tool_factory.create_tools.return_value = FakeToolContext([browser_tool])
  mock_tool_factory_cls.return_value = mock_tool_factory
  mock_agent = AsyncMock()
  mock_agent.ainvoke.return_value = {"structured_response": TaskAgentResult(content="인터넷 조회 요약")}
  mock_create_agent.return_value = mock_agent
  sut = TaskAgent()

  result = await sut.ainvoke(
    system_prompt="웹 검색 담당",
    user_message="오늘 날씨를 찾아줘",
    tool_codes=[ToolCode.WEB_BROWSER_CONTROL],
  )

  assert result == "인터넷 조회 요약"
  mock_tool_factory.create_tools.assert_called_once_with([ToolCode.WEB_BROWSER_CONTROL])
  mock_create_agent.assert_called_once_with(
    model=mock_llm, tools=[browser_tool], system_prompt="웹 검색 담당", response_format=ToolStrategy(TaskAgentResult)
  )
  mock_agent.ainvoke.assert_called_once_with({"messages": [{"role": "user", "content": "오늘 날씨를 찾아줘"}]})


@patch("agents.task_agent.create_agent")
@patch("agents.task_agent.ToolFactory")
@patch("agents.task_agent.get_llm")
async def test_task_agent_도구_코드가_있어도_생성된_도구가_없으면_LLM을_직접_호출한다(
  mock_get_llm: MagicMock,
  mock_tool_factory_cls: MagicMock,
  mock_create_agent: MagicMock,
  mock_llm: AsyncMock,
) -> None:
  mock_get_llm.return_value = mock_llm
  mock_llm.ainvoke.return_value = MagicMock(content="직접 처리 완료")
  mock_tool_factory = MagicMock()
  mock_tool_factory.create_tools.return_value = FakeToolContext([])
  mock_tool_factory_cls.return_value = mock_tool_factory
  sut = TaskAgent()

  result = await sut.ainvoke(system_prompt="검색 담당 에이전트", user_message="이메일을 정리해줘", tool_codes=["UNKNOWN"])

  assert result == "직접 처리 완료"
  mock_create_agent.assert_not_called()
  mock_llm.ainvoke.assert_called_once_with(
    [
      {"role": "system", "content": "검색 담당 에이전트"},
      {"role": "user", "content": "이메일을 정리해줘"},
    ]
  )
