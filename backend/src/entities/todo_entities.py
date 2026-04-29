import uuid
from enum import StrEnum

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from repositories.database import Base


class TodoStatus(StrEnum):
  PENDING = "pending"
  ASSIGNED = "assigned"
  COMPLETED = "completed"
  FAILED = "failed"


class TodoEntity(Base):
  __tablename__ = "tb_todos"

  id: Mapped[str] = mapped_column(primary_key=True, default=lambda: str(uuid.uuid4()))
  title: Mapped[str]
  content: Mapped[str]
  status: Mapped[TodoStatus] = mapped_column(
    String,
    default=TodoStatus.PENDING,
  )
  assigned_agent_name: Mapped[str | None] = mapped_column(nullable=True, default=None)
  result: Mapped[str | None] = mapped_column(nullable=True, default=None)
