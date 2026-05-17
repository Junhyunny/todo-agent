from uuid import UUID

from entities import AgentEntity
from repositories.unit_of_work import AbstractUnitOfWork
from schemas.agent_api_schema import AgentRequest, AgentResponse


class AgentService:
  def __init__(self, unit_of_work: AbstractUnitOfWork) -> None:
    self.unit_of_work = unit_of_work

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
    async with self.unit_of_work as uow:
      result = await uow.agents.create(
        model=AgentEntity(name=request.name, description=request.description, system_prompt=request.system_prompt),
        tool_ids=request.tools,
      )
      await uow.commit()
      return self._to_response(result)

  async def get_agents(self) -> list[AgentResponse]:
    async with self.unit_of_work as uow:
      agent_lit = await uow.agents.get_all()
      return [self._to_response(agent) for agent in agent_lit]

  async def update_agent(self, agent_id: UUID, request: AgentRequest) -> AgentResponse:
    tool_ids = list(dict.fromkeys(request.tools))
    async with self.unit_of_work as uow:
      result = await uow.agents.update(
        agent_id=agent_id,
        model=AgentEntity(name=request.name, description=request.description, system_prompt=request.system_prompt),
        tool_ids=tool_ids,
      )
      await uow.commit()
      return self._to_response(result)

  async def exists_agent_by_name(self, name: str) -> bool:
    async with self.unit_of_work as uow:
      return await uow.agents.exists_by_name(name=name)

  async def delete_agent(self, agent_id: UUID) -> None:
    async with self.unit_of_work as uow:
      await uow.agents.delete(agent_id=agent_id)
      await uow.commit()
