import uuid

from pydantic import BaseModel


class ToolResponse(BaseModel):
  id: uuid.UUID
  name: str
