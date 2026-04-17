import uuid

from sqlalchemy.orm import Mapped, mapped_column

from repositories.database import Base


class TodoModel(Base):
  __tablename__ = "tb_todos"

  id: Mapped[str] = mapped_column(primary_key=True, default=lambda: str(uuid.uuid4()))
  title: Mapped[str]
  content: Mapped[str]
  status: Mapped[str] = mapped_column(default="pending")
