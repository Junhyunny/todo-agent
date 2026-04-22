import asyncio

from channels.channel_names import TODO_STATUS_CHANNEL
from services.orchestration_service import OrchestrationService
from sse.manager import SSEManager


async def run_assignment_listener(
  assign_que: asyncio.Queue[str],
  orchestration_service: OrchestrationService,
  sse_manager: SSEManager,
) -> None:
  while True:
    todo_id = await assign_que.get()
    try:
      agent = await orchestration_service.select_and_assign(todo_id)
      if agent is None:
        continue

      await sse_manager.publish(TODO_STATUS_CHANNEL(todo_id), {"type": "assigned", "agent_name": agent.name})

      await orchestration_service.execute_and_complete(todo_id, agent)
      await sse_manager.publish(TODO_STATUS_CHANNEL(todo_id), {"type": "completed", "agent_name": agent.name})
    except Exception:
      pass
    finally:
      assign_que.task_done()
