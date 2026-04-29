from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from repositories.database import Base

if TYPE_CHECKING:
  from entities.tool_entities import ToolEntity


class AgentToolEntity(Base):
  __tablename__ = "tb_agent_tools"

  agent_id: Mapped[str] = mapped_column(ForeignKey("tb_agents.id"), primary_key=True)
  tool_id: Mapped[str] = mapped_column(ForeignKey("tb_tools.id"), primary_key=True)
  tool: Mapped["ToolEntity"] = relationship("ToolEntity", lazy="selectin")
