from uuid import UUID

from fastapi import APIRouter, Depends
from starlette import status

from schemas.todo_api_schema import PostTodoRequest, TodoResponse
from services.dependencies import get_todo_service
from services.todo_service import TodoService

router = APIRouter()


@router.post("/api/todos", status_code=status.HTTP_201_CREATED)
async def create_todo(request: PostTodoRequest, todo_service: TodoService = Depends(get_todo_service)) -> TodoResponse:
  return await todo_service.create_todo(request=request)


@router.get("/api/todos", status_code=status.HTTP_200_OK)
async def get_todos(todo_service: TodoService = Depends(get_todo_service)) -> list[TodoResponse]:
  return await todo_service.get_todos()


@router.delete("/api/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(todo_id: str, todo_service: TodoService = Depends(get_todo_service)) -> None:
  await todo_service.delete_todo(todo_id=UUID(todo_id))


@router.post("/api/todos/{todo_id}/reassign", status_code=status.HTTP_204_NO_CONTENT)
async def reassign_todo(todo_id: str, todo_service: TodoService = Depends(get_todo_service)) -> None:
  await todo_service.reassign_todo(todo_id=UUID(todo_id))
