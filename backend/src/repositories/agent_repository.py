import uuid
from collections.abc import Sequence
from typing import Annotated
from uuid import UUID

from fastapi import Depends
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from models import AgentModel
from repositories.database import get_session


class AgentRepository:
  def __init__(self, session: Annotated[AsyncSession, Depends(get_session)]):
    self.session = session

  async def create(self, model: AgentModel) -> AgentModel:
    new_model = AgentModel(id=str(uuid.uuid4()), name=model.name, system_prompt=model.system_prompt)
    self.session.add(new_model)
    await self.session.commit()
    return new_model

  async def get_all(self) -> Sequence[AgentModel]:
    query = select(AgentModel)
    result = await self.session.execute(query)
    castle_lit = result.scalars().all()
    return castle_lit

  async def update(self, agent_id: UUID, model: AgentModel) -> AgentModel:
    query = select(AgentModel).where(AgentModel.id == str(agent_id))
    result = await self.session.execute(query)
    existing_model: AgentModel | None = result.scalar_one_or_none()
    if existing_model:
      existing_model.name = model.name
      existing_model.system_prompt = model.system_prompt
      await self.session.commit()
      return existing_model
    raise RuntimeError("not found")

  async def delete(self, agent_id: UUID):
    query = delete(AgentModel).where(AgentModel.id == str(agent_id))
    await self.session.execute(query)
    await self.session.commit()
