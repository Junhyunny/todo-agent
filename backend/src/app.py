import uuid

from fastapi import Depends, FastAPI, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_session
from models import AgentModel

app = FastAPI()

class PostAgentRequest(BaseModel):
  name: str
  system_prompt: str


class AgentResponse(BaseModel):
  id: uuid.UUID
  name: str
  system_prompt: str


@app.post("/api/agents", status_code=status.HTTP_201_CREATED)
async def create_agent(request: PostAgentRequest, db: AsyncSession = Depends(get_session)) -> AgentResponse:
  random_id = uuid.uuid4()
  db.add(AgentModel(id=str(random_id), name=request.name, system_prompt=request.system_prompt))
  await db.commit()
  return AgentResponse(id=random_id, name=request.name, system_prompt=request.system_prompt)


@app.get("/api/agents", status_code=status.HTTP_200_OK)
async def get_agents(db: AsyncSession = Depends(get_session)) -> list[AgentResponse]:
  select_stmt = select(AgentModel)
  result = await db.execute(select_stmt)
  agents = result.fetchall()
  return [AgentResponse(id=row[0].id, name=row[0].name, system_prompt=row[0].system_prompt) for row in agents]


@app.put("/api/agents/{agent_id}", status_code=status.HTTP_200_OK)
async def update_agent(agent_id: str, request: PostAgentRequest, db: AsyncSession = Depends(get_session)) -> AgentResponse:
  result = await db.execute(select(AgentModel).where(AgentModel.id == agent_id))
  agent = result.scalar_one()
  agent.name = request.name
  agent.system_prompt = request.system_prompt
  await db.commit()
  return AgentResponse(id=uuid.UUID(agent.id), name=agent.name, system_prompt=agent.system_prompt)


@app.delete("/api/agents/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(agent_id: str, db: AsyncSession = Depends(get_session)) -> None:
  result = await db.execute(select(AgentModel).where(AgentModel.id == agent_id))
  agent = result.scalar_one()
  await db.delete(agent)
  await db.commit()