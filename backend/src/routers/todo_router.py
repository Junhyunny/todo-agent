from fastapi import APIRouter, Depends
from starlette import status

from models.todo_api_schema import PostTodoRequest, TodoResponse
from services.todo_service import TodoService

router = APIRouter()


@router.post("/api/todos", status_code=status.HTTP_201_CREATED)
async def create_todo(request: PostTodoRequest, todo_service: TodoService = Depends(TodoService)) -> TodoResponse:
  return await todo_service.create_todo(request=request)


@router.get("/api/todos", status_code=status.HTTP_200_OK)
async def get_todos(todo_service: TodoService = Depends(TodoService)) -> list[TodoResponse]:
  return await todo_service.get_todos()
