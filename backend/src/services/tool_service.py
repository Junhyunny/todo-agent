from typing import Annotated
from uuid import UUID

from fastapi import Depends

from repositories.tool_repository import ToolRepository
from schemas.tool_api_schema import ToolResponse


class ToolService:
  def __init__(self, tool_repository: Annotated[ToolRepository, Depends(ToolRepository)]):
    self.tool_repository = tool_repository

  async def get_tools(self) -> list[ToolResponse]:
    tool_list = await self.tool_repository.get_all()
    return [ToolResponse(id=UUID(tool.id), name=tool.name) for tool in tool_list]
