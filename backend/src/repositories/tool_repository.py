from collections.abc import Sequence
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from entities import ToolEntity
from repositories.database import get_session


class ToolRepository:
  def __init__(self, session: Annotated[AsyncSession, Depends(get_session)]):
    self.session = session

  async def get_all(self) -> Sequence[ToolEntity]:
    query = select(ToolEntity)
    result = await self.session.execute(query)
    return result.scalars().all()
