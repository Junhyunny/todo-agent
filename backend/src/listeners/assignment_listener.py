import asyncio

from channels.channel_names import TODO_STATUS_CHANNEL
from entities.todo_entities import TodoStatus
from services.orchestration_service import OrchestrationService
from sse.manager import SSEManager


def assignment_message(type: str) -> dict[str, str]:
  return {"type": type}


async def run_assignment_listener(
  assign_que: asyncio.Queue[str],
  orchestration_service: OrchestrationService,
  sse_manager: SSEManager,
) -> None:
  while True:
    todo_id = await assign_que.get()
    channel_name = TODO_STATUS_CHANNEL(todo_id)
    try:
      agent = await orchestration_service.select_and_assign(todo_id)
      if agent is None:
        await sse_manager.publish(channel_name, assignment_message(TodoStatus.FAILED.value))
        continue
      await sse_manager.publish(channel_name, assignment_message(TodoStatus.ASSIGNED.value))
      await orchestration_service.execute_and_complete(todo_id, agent)
      await sse_manager.publish(channel_name, assignment_message(TodoStatus.COMPLETED.value))
    except Exception:
      await sse_manager.publish(channel_name, assignment_message(TodoStatus.FAILED.value))
    finally:
      assign_que.task_done()
