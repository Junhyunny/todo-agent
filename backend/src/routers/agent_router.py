from uuid import UUID

from fastapi import APIRouter, Depends
from starlette import status

from models.agent_api_schema import AgentRequest, AgentResponse
from services.agent_service import AgentService

router = APIRouter()


@router.post("/api/agents", status_code=status.HTTP_201_CREATED)
async def create_agent(request: AgentRequest, agent_service: AgentService = Depends(AgentService)) -> AgentResponse:
  return await agent_service.create_agent(request=request)


@router.get("/api/agents", status_code=status.HTTP_200_OK)
async def get_agents(agent_service: AgentService = Depends(AgentService)) -> list[AgentResponse]:
  return await agent_service.get_agents()


@router.put("/api/agents/{agent_id}", status_code=status.HTTP_200_OK)
async def update_agent(agent_id: str, request: AgentRequest, agent_service: AgentService = Depends(AgentService)) -> AgentResponse:
  return await agent_service.update_agent(agent_id=UUID(agent_id), request=request)


@router.delete("/api/agents/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(agent_id: str, agent_service: AgentService = Depends(AgentService)):
  await agent_service.delete_agent(agent_id=UUID(agent_id))
