from uuid import UUID

from agents.task_agent import TaskAgent
from channels.channel_names import TODO_STATUS_CHANNEL
from entities import AgentEntity
from entities.todo_entities import TodoStatus
from repositories.unit_of_work import UnitOfWorkFactory
from sse.manager import SSEManager


class TaskService:
  def __init__(self, task_agent: TaskAgent, unit_of_work_factory: UnitOfWorkFactory, sse_manager: SSEManager) -> None:
    self.task_agent = task_agent
    self.unit_of_work_factory = unit_of_work_factory
    self.sse_manager = sse_manager

  async def __fail_task(self, todo_id: str, reason: str | None = None) -> None:
    try:
      async with self.unit_of_work_factory() as uow:
        await uow.todos.fail_todo(UUID(todo_id), reason=reason)
        await uow.commit()
    except Exception as e:
      print("__fail_task error", e)

  async def execute_and_complete(self, todo_id: str, agent: AgentEntity) -> None:
    channel_name = TODO_STATUS_CHANNEL(todo_id)
    try:
      async with self.unit_of_work_factory() as uow:
        todo = await uow.todos.find_by_id(UUID(todo_id))
        if todo is None:
          raise RuntimeError(f"todo {todo_id} not found")
        todo_title = todo.title
        todo_content = todo.content

      user_message = f"{todo_title}\n{todo_content}"
      tool_codes = [agent_tool.tool.code for agent_tool in agent.tools]
      result = await self.task_agent.ainvoke(system_prompt=agent.system_prompt, user_message=user_message, tool_codes=tool_codes)

      async with self.unit_of_work_factory() as uow:
        await uow.todos.complete_todo(UUID(todo_id), result=result)
        await uow.commit()

      await self.sse_manager.publish(channel_name, {"type": TodoStatus.COMPLETED.value})

    except Exception as e:
      print("execute_and_complete exception", e)
      await self.__fail_task(todo_id, reason=str(e))
      await self.sse_manager.publish(channel_name, {"type": TodoStatus.FAILED.value})
      raise
