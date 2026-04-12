import uuid

from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class AgentModel(Base):
  __tablename__ = "agents"

  id: Mapped[str] = mapped_column(primary_key=True, default=lambda: str(uuid.uuid4()))
  name: Mapped[str]
  system_prompt: Mapped[str]
