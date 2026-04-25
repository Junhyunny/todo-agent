import uuid
from collections.abc import Sequence
from typing import Annotated
from uuid import UUID

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from entities import AgentEntity, AgentToolEntity
from repositories.database import get_session


class AgentRepository:
  def __init__(self, session: Annotated[AsyncSession, Depends(get_session)]):
    self.session = session

  async def create(self, model: AgentEntity, tool_ids: list[str]) -> AgentEntity:
    new_id = str(uuid.uuid4())
    new_model = AgentEntity(id=new_id, name=model.name, description=model.description, system_prompt=model.system_prompt)
    new_model.tools = [AgentToolEntity(agent_id=new_id, tool_id=tid) for tid in tool_ids]
    self.session.add(new_model)
    await self.session.commit()
    return new_model

  async def get_all(self) -> Sequence[AgentEntity]:
    query = select(AgentEntity)
    result = await self.session.execute(query)
    castle_lit = result.scalars().all()
    return castle_lit

  async def update(self, agent_id: UUID, model: AgentEntity, tool_ids: list[str]) -> AgentEntity:
    query = select(AgentEntity).where(AgentEntity.id == str(agent_id))
    result = await self.session.execute(query)
    existing_model: AgentEntity | None = result.scalar_one_or_none()
    if existing_model:
      existing_model.name = model.name
      existing_model.description = model.description
      existing_model.system_prompt = model.system_prompt
      existing_model.tools = [AgentToolEntity(agent_id=str(agent_id), tool_id=tid) for tid in tool_ids]
      await self.session.commit()
      return existing_model
    raise RuntimeError("not found")

  async def exists_by_name(self, name: str) -> bool:
    query = select(AgentEntity).where(AgentEntity.name == name)
    result = await self.session.execute(query)
    return result.scalar_one_or_none() is not None

  async def delete(self, agent_id: UUID):
    query = select(AgentEntity).where(AgentEntity.id == str(agent_id))
    result = await self.session.execute(query)
    entity = result.scalar_one_or_none()
    if entity:
      await self.session.delete(entity)
      await self.session.commit()
