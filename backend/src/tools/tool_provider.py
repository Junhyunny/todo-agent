from typing import Protocol

from langchain_core.tools import BaseTool


class ToolProvider(Protocol):
  async def get_tools(self) -> list[BaseTool]:
    pass

  async def close(self) -> None:
    pass
