import uuid
from uuid import UUID

from entities.todo_entities import TodoEntity
from pubs.assignment_publisher import AssignmentPublisher
from repositories.unit_of_work import AbstractUnitOfWork
from schemas.todo_api_schema import PostTodoRequest, TodoResponse


class TodoService:
  def __init__(
    self,
    unit_of_work: AbstractUnitOfWork,
    publisher: AssignmentPublisher,
  ) -> None:
    self.unit_of_work = unit_of_work
    self.publisher = publisher

  @staticmethod
  def _to_response(entity: TodoEntity) -> TodoResponse:
    return TodoResponse(
      id=uuid.UUID(entity.id),
      title=entity.title,
      content=entity.content,
      status=entity.status,
      assigned_agent_name=entity.assigned_agent_name,
      result=entity.result,
    )

  async def create_todo(self, request: PostTodoRequest) -> TodoResponse:
    async with self.unit_of_work as uow:
      result = await uow.todos.create(model=TodoEntity(title=request.title, content=request.content, status="pending"))
      await uow.commit()
      response = self._to_response(result)
    await self.publisher.publish(str(response.id))
    return response

  async def reassign_todo(self, todo_id: UUID) -> None:
    async with self.unit_of_work as uow:
      await uow.todos.reset_to_pending(todo_id=todo_id)
      await uow.commit()
    await self.publisher.publish(str(todo_id))

  async def delete_todo(self, todo_id: UUID) -> None:
    async with self.unit_of_work as uow:
      await uow.todos.delete(todo_id=todo_id)
      await uow.commit()

  async def get_todos(self) -> list[TodoResponse]:
    async with self.unit_of_work as uow:
      todo_list = await uow.todos.get_all()
      return [self._to_response(todo) for todo in todo_list]
