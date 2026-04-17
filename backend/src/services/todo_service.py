import uuid
from typing import Annotated

from fastapi import Depends

from models.todo_api_schema import PostTodoRequest, TodoResponse
from models.todo_models import TodoModel
from repositories.todo_repository import TodoRepository


class TodoService:
  def __init__(self, todo_repository: Annotated[TodoRepository, Depends(TodoRepository)]):
    self.todo_repository = todo_repository

  async def create_todo(self, request: PostTodoRequest) -> TodoResponse:
    result = await self.todo_repository.create(
      model=TodoModel(title=request.title, content=request.content, status="pending")
    )
    return TodoResponse(id=uuid.UUID(result.id), title=result.title, content=result.content, status=result.status)

  async def get_todos(self) -> list[TodoResponse]:
    todo_list = await self.todo_repository.get_all()
    return [
      TodoResponse(id=uuid.UUID(todo.id), title=todo.title, content=todo.content, status=todo.status)
      for todo in todo_list
    ]
