from typing import Annotated
from uuid import UUID

from fastapi import Depends

from models import AgentModel
from models.agent_api_schema import AgentRequest, AgentResponse
from repositories.agent_repository import AgentRepository


class AgentService:
  def __init__(self, agent_repository: Annotated[AgentRepository, Depends(AgentRepository)]):
    self.agent_repository = agent_repository

  async def create_agent(self, request: AgentRequest) -> AgentResponse:
    result = await self.agent_repository.create(model=AgentModel(name=request.name, system_prompt=request.system_prompt))
    return AgentResponse(id=UUID(result.id), name=result.name, system_prompt=result.system_prompt)

  async def get_agents(self) -> list[AgentResponse]:
    agent_lit = await self.agent_repository.get_all()
    return [AgentResponse(id=UUID(agent.id), name=agent.name, system_prompt=agent.system_prompt) for agent in agent_lit]

  async def update_agent(self, agent_id: UUID, request: AgentRequest) -> AgentResponse:
    result = await self.agent_repository.update(agent_id=agent_id, model=AgentModel(name=request.name, system_prompt=request.system_prompt))
    return AgentResponse(id=UUID(result.id), name=result.name, system_prompt=result.system_prompt)

  async def exists_agent_by_name(self, name: str) -> bool:
    return await self.agent_repository.exists_by_name(name=name)

  async def delete_agent(self, agent_id: UUID):
    await self.agent_repository.delete(agent_id=agent_id)
