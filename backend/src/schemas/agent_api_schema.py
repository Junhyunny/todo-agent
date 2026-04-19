import uuid

from pydantic import BaseModel


class AgentRequest(BaseModel):
  name: str
  system_prompt: str


class AgentResponse(BaseModel):
  id: uuid.UUID
  name: str
  system_prompt: str
