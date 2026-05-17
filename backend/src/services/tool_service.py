from uuid import UUID

from repositories.unit_of_work import AbstractUnitOfWork
from schemas.tool_api_schema import ToolResponse


class ToolService:
  def __init__(self, unit_of_work: AbstractUnitOfWork) -> None:
    self.unit_of_work = unit_of_work

  async def get_tools(self) -> list[ToolResponse]:
    async with self.unit_of_work as uow:
      tool_list = await uow.tools.get_all()
      return [ToolResponse(id=UUID(tool.id), name=tool.name) for tool in tool_list]
