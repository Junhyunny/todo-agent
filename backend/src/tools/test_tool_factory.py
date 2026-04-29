from unittest.mock import MagicMock

from models.tool_codes import ToolCode
from tools.tool_factory import ToolFactory


class FakeToolProvider:
  def __init__(self, tool: MagicMock) -> None:
    self.tool = tool
    self.closed = False

  async def get_tools(self) -> list[MagicMock]:
    return [self.tool]

  async def close(self) -> None:
    self.closed = True


async def test_create_tools_도구_코드가_없으면_빈_리스트를_반환한다() -> None:
  sut = ToolFactory(registry={})

  async with sut.create_tools([]) as result:
    assert result == []


async def test_create_tools_WEB_BROWSER_CONTROL_코드가_있으면_등록된_provider의_도구를_반환한다() -> None:
  tool = MagicMock()
  providers: list[FakeToolProvider] = []

  def create_provider() -> FakeToolProvider:
    provider = FakeToolProvider(tool)
    providers.append(provider)
    return provider

  sut = ToolFactory(registry={ToolCode.WEB_BROWSER_CONTROL: create_provider})

  async with sut.create_tools([ToolCode.WEB_BROWSER_CONTROL]) as result:
    assert result == [tool]

  assert providers[0].closed is True


async def test_create_tools_지원하지_않는_코드는_무시한다() -> None:
  sut = ToolFactory(registry={})

  async with sut.create_tools(["UNKNOWN"]) as result:
    assert result == []


async def test_create_tools_중복된_도구_코드는_한_번만_생성한다() -> None:
  tool = MagicMock()
  providers: list[FakeToolProvider] = []

  def create_provider() -> FakeToolProvider:
    provider = FakeToolProvider(tool)
    providers.append(provider)
    return provider

  sut = ToolFactory(registry={ToolCode.WEB_BROWSER_CONTROL: create_provider})

  async with sut.create_tools([ToolCode.WEB_BROWSER_CONTROL, ToolCode.WEB_BROWSER_CONTROL]) as result:
    assert result == [tool]

  assert len(providers) == 1
  assert providers[0].closed is True


async def test_create_tools_여러_도구_코드가_있으면_모든_provider의_도구를_반환한다() -> None:
  tool = MagicMock()
  providers: list[FakeToolProvider] = []

  def create_provider() -> FakeToolProvider:
    provider = FakeToolProvider(tool)
    providers.append(provider)
    return provider

  sut = ToolFactory(registry={ToolCode.WEB_BROWSER_CONTROL: create_provider, "ANOTHER_TOOL": create_provider})

  async with sut.create_tools([ToolCode.WEB_BROWSER_CONTROL, "ANOTHER_TOOL"]) as result:
    assert result == [tool, tool]

  assert len(providers) == 2
  assert providers[0].closed is True
  assert providers[1].closed is True
