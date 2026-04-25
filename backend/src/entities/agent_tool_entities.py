from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from repositories.database import Base


class AgentToolEntity(Base):
  __tablename__ = "tb_agent_tools"

  agent_id: Mapped[str] = mapped_column(ForeignKey("tb_agents.id"), primary_key=True)
  tool_id: Mapped[str] = mapped_column(ForeignKey("tb_tools.id"), primary_key=True)
