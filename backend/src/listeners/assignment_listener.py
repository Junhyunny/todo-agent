import asyncio
from uuid import UUID

from channels.channel_names import TODO_ASSIGN_CHANNEL
from repositories.agent_repository import AgentRepository
from repositories.database import async_session_factory
from repositories.todo_repository import TodoRepository
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
      async with async_session_factory() as session:
        todo_repo = TodoRepository(session=session)
        agent_repo = AgentRepository(session=session)

        todo = await todo_repo.find_by_id(UUID(todo_id))
        agents = list(await agent_repo.get_all())

        if not todo or not agents:
          continue

        agent_name = await orchestration_service.select_agent(
          todo,
          agents=agents,
        )
        await todo_repo.assign_agent(UUID(todo_id), agent_name)
        await sse_manager.publish(TODO_ASSIGN_CHANNEL(todo_id), {"type": "assigned", "agent_name": agent_name})
    except Exception:
      pass
    finally:
      assign_que.task_done()
