import uuid

from sqlalchemy.orm import Mapped, mapped_column

from repositories.database import Base


class AgentEntity(Base):
  __tablename__ = "tb_agents"

  id: Mapped[str] = mapped_column(primary_key=True, default=lambda: str(uuid.uuid4()))
  name: Mapped[str]
  system_prompt: Mapped[str]
