from collections.abc import Sequence

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from entities import ToolEntity


class ToolRepository:
  def __init__(self, session: AsyncSession) -> None:
    self.session = session

  async def get_all(self) -> Sequence[ToolEntity]:
    query = select(ToolEntity)
    result = await self.session.execute(query)
    return result.scalars().all()
