import uuid

from fastapi import Depends, FastAPI, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_session
from models import AgentModel

app = FastAPI()

class PostAgentRequest(BaseModel):
  name: str
  system_prompt: str


class PostAgentResponse(BaseModel):
  id: uuid.UUID
  name: str
  system_prompt: str


@app.post("/agents", status_code=status.HTTP_201_CREATED)
async def create_agent(request: PostAgentRequest, db: AsyncSession = Depends(get_session)) -> PostAgentResponse:
  random_id = uuid.uuid4()
  db.add(AgentModel(id=str(random_id), name=request.name, system_prompt=request.system_prompt))
  await db.commit()
  return PostAgentResponse(id=random_id, name=request.name, system_prompt=request.system_prompt)