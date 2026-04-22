import uuid

from pydantic import BaseModel


class PostTodoRequest(BaseModel):
  title: str
  content: str


class TodoResponse(BaseModel):
  id: uuid.UUID
  title: str
  content: str
  status: str
  assigned_agent_name: str | None = None
  result: str | None = None
