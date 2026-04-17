import uuid
from collections.abc import Sequence
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from models.todo_models import TodoModel
from repositories.database import get_session


class TodoRepository:
  def __init__(self, session: Annotated[AsyncSession, Depends(get_session)]):
    self.session = session

  async def create(self, model: TodoModel) -> TodoModel:
    new_model = TodoModel(
      id=str(uuid.uuid4()),
      title=model.title,
      content=model.content,
      status=model.status,
    )
    self.session.add(new_model)
    await self.session.commit()
    return new_model

  async def get_all(self) -> Sequence[TodoModel]:
    query = select(TodoModel)
    result = await self.session.execute(query)
    return result.scalars().all()
