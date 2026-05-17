import asyncio

from services.assign_service import AssignService
from services.task_service import TaskService


async def run_assignment_listener(
  assign_que: asyncio.Queue[str],
  assign_service: AssignService,
  task_service: TaskService,
) -> None:
  while True:
    todo_id = await assign_que.get()
    try:
      agent = await assign_service.select_and_assign(todo_id)
      await task_service.execute_and_complete(todo_id, agent)
    except Exception as e:
      print("run_assignment_listener exception", todo_id, e)
    finally:
      assign_que.task_done()
