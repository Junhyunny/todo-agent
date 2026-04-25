import uuid

from pydantic import BaseModel


class AgentRequest(BaseModel):
  name: str
  description: str
  system_prompt: str
  tools: list[str]


class AgentResponse(BaseModel):
  id: uuid.UUID
  name: str
  description: str
  system_prompt: str
  tools: list[str]
