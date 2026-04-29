import uuid

from sqlalchemy.orm import Mapped, mapped_column

from repositories.database import Base


class ToolEntity(Base):
  __tablename__ = "tb_tools"

  id: Mapped[str] = mapped_column(primary_key=True, default=lambda: str(uuid.uuid4()))
  name: Mapped[str]
  code: Mapped[str] = mapped_column(unique=True)
