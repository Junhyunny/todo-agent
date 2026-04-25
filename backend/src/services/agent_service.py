from typing import Annotated
from uuid import UUID

from fastapi import Depends

from entities import AgentEntity
from repositories.agent_repository import AgentRepository
from schemas.agent_api_schema import AgentRequest, AgentResponse


class AgentService:
  def __init__(self, agent_repository: Annotated[AgentRepository, Depends(AgentRepository)]):
    self.agent_repository = agent_repository

  @staticmethod
  def _to_response(entity: AgentEntity) -> AgentResponse:
    return AgentResponse(
      id=UUID(entity.id),
      name=entity.name,
      description=entity.description,
      system_prompt=entity.system_prompt,
      tools=[t.tool_id for t in entity.tools],
    )

  async def create_agent(self, request: AgentRequest) -> AgentResponse:
    result = await self.agent_repository.create(
      model=AgentEntity(name=request.name, description=request.description, system_prompt=request.system_prompt),
      tool_ids=request.tools,
    )
    return self._to_response(result)

  async def get_agents(self) -> list[AgentResponse]:
    agent_lit = await self.agent_repository.get_all()
    return [self._to_response(agent) for agent in agent_lit]

  async def update_agent(self, agent_id: UUID, request: AgentRequest) -> AgentResponse:
    tool_ids = list(dict.fromkeys(request.tools))
    result = await self.agent_repository.update(
      agent_id=agent_id,
      model=AgentEntity(name=request.name, description=request.description, system_prompt=request.system_prompt),
      tool_ids=tool_ids,
    )
    return self._to_response(result)

  async def exists_agent_by_name(self, name: str) -> bool:
    return await self.agent_repository.exists_by_name(name=name)

  async def delete_agent(self, agent_id: UUID):
    await self.agent_repository.delete(agent_id=agent_id)
