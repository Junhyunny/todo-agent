import uuid

from sqlalchemy.orm import Mapped, mapped_column, relationship

from entities.agent_tool_entities import AgentToolEntity as AgentToolEntity  # noqa: E402
from repositories.database import Base


class AgentEntity(Base):
  __tablename__ = "tb_agents"

  id: Mapped[str] = mapped_column(primary_key=True, default=lambda: str(uuid.uuid4()))
  name: Mapped[str]
  description: Mapped[str] = mapped_column(server_default="")
  system_prompt: Mapped[str]
  tools: Mapped[list["AgentToolEntity"]] = relationship(
    "AgentToolEntity",
    cascade="all, delete-orphan",
    lazy="selectin",
  )
