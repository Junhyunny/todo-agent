import uuid
from collections.abc import Sequence
from typing import Annotated
from uuid import UUID

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from entities.todo_entities import TodoEntity, TodoStatus
from repositories.database import get_session


class TodoRepository:
  def __init__(self, session: Annotated[AsyncSession, Depends(get_session)]):
    self.session = session

  async def create(self, model: TodoEntity) -> TodoEntity:
    new_model = TodoEntity(
      id=str(uuid.uuid4()),
      title=model.title,
      content=model.content,
      status=model.status,
    )
    self.session.add(new_model)
    await self.session.commit()
    return new_model

  async def get_all(self) -> Sequence[TodoEntity]:
    query = select(TodoEntity)
    result = await self.session.execute(query)
    return result.scalars().all()

  async def find_by_id(self, todo_id: UUID) -> TodoEntity | None:
    result = await self.session.execute(select(TodoEntity).where(TodoEntity.id == str(todo_id)))
    return result.scalar_one_or_none()

  async def assign_agent(self, todo_id: UUID, agent_name: str | None) -> TodoEntity:
    model = await self.find_by_id(todo_id)
    if not model:
      raise RuntimeError("not found")
    model.assigned_agent_name = agent_name
    model.status = TodoStatus.ASSIGNED
    await self.session.commit()
    return model

  async def delete(self, todo_id: UUID) -> None:
    todo = await self.find_by_id(todo_id)
    if not todo:
      raise RuntimeError("not found")
    await self.session.delete(todo)
    await self.session.commit()

  async def complete_todo(self, todo_id: UUID, result: str) -> None:
    model = await self.find_by_id(todo_id)
    if not model:
      raise RuntimeError("not found")
    model.status = TodoStatus.COMPLETED
    model.result = result
    await self.session.commit()

  async def fail_todo(self, todo_id: UUID, reason: str | None = None) -> None:
    model = await self.find_by_id(todo_id)
    if not model:
      raise RuntimeError("not found")
    model.status = TodoStatus.FAILED
    model.result = reason
    await self.session.commit()
