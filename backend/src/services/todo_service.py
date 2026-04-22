import uuid
from typing import Annotated

from fastapi import Depends

from entities.todo_entities import TodoEntity
from pubs.assignment_publisher import AssignmentPublisher, get_assignment_publisher
from repositories.todo_repository import TodoRepository
from schemas.todo_api_schema import PostTodoRequest, TodoResponse


class TodoService:
  def __init__(
    self,
    todo_repository: Annotated[TodoRepository, Depends(TodoRepository)],
    publisher: Annotated[AssignmentPublisher, Depends(get_assignment_publisher)],
  ) -> None:
    self.todo_repository = todo_repository
    self.publisher = publisher

  async def create_todo(self, request: PostTodoRequest) -> TodoResponse:
    result = await self.todo_repository.create(model=TodoEntity(title=request.title, content=request.content, status="pending"))
    await self.publisher.publish(str(result.id))
    return TodoResponse(
      id=uuid.UUID(result.id),
      title=result.title,
      content=result.content,
      status=result.status,
      assigned_agent_name=result.assigned_agent_name,
      result=result.result,
    )

  async def get_todos(self) -> list[TodoResponse]:
    todo_list = await self.todo_repository.get_all()
    return [
      TodoResponse(
        id=uuid.UUID(todo.id),
        title=todo.title,
        content=todo.content,
        status=todo.status,
        assigned_agent_name=todo.assigned_agent_name,
        result=todo.result,
      )
      for todo in todo_list
    ]
