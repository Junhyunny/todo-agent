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
