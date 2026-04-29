from collections.abc import AsyncGenerator, Callable, Sequence
from contextlib import asynccontextmanager

from langchain_core.tools import BaseTool

from models.tool_codes import ToolCode
from tools.playwright_browser_control_toolkit import PlaywrightBrowserControlToolProvider
from tools.tool_provider import ToolProvider

ToolProviderFactory = Callable[[], ToolProvider]


class ToolFactory:
  def __init__(self, registry: dict[str, ToolProviderFactory] | None = None) -> None:
    self.registry = (
      registry
      if registry is not None
      else {
        ToolCode.WEB_BROWSER_CONTROL: PlaywrightBrowserControlToolProvider,
      }
    )

  @asynccontextmanager
  async def create_tools(self, tool_codes: Sequence[str]) -> AsyncGenerator[list[BaseTool], None]:
    providers = [self.registry[code]() for code in dict.fromkeys(tool_codes) if code in self.registry]
    tools: list[BaseTool] = []
    try:
      for provider in providers:
        tools.extend(await provider.get_tools())
      yield tools
    finally:
      for provider in reversed(providers):
        await provider.close()
