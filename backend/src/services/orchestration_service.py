import json
from uuid import UUID

from agents.orchestration_agent import OrchestrationAgent
from agents.task_agent import TaskAgent
from entities import AgentEntity, AgentToolEntity, ToolEntity
from repositories.unit_of_work import UnitOfWorkFactory


class OrchestrationService:
  def __init__(self, orchestration_agent: OrchestrationAgent, task_agent: TaskAgent, unit_of_work_factory: UnitOfWorkFactory) -> None:
    self.orchestration_agent = orchestration_agent
    self.task_agent = task_agent
    self.unit_of_work_factory = unit_of_work_factory

  @staticmethod
  def __copy_agent(agent: AgentEntity) -> AgentEntity:
    copied_agent = AgentEntity(id=agent.id, name=agent.name, description=agent.description, system_prompt=agent.system_prompt)
    copied_agent.tools = [
      AgentToolEntity(
        agent_id=agent_tool.agent_id,
        tool_id=agent_tool.tool_id,
        tool=ToolEntity(id=agent_tool.tool.id, name=agent_tool.tool.name, code=agent_tool.tool.code),
      )
      for agent_tool in agent.tools
    ]
    return copied_agent

  async def __fail_assignment(self, todo_id: str, reason: str | None = None) -> None:
    async with self.unit_of_work_factory() as uow:
      await uow.todos.fail_todo(UUID(todo_id), reason=reason)
      await uow.commit()

  async def select_and_assign(self, todo_id: str) -> AgentEntity | None:
    try:
      todo_uuid = UUID(todo_id)
      async with self.unit_of_work_factory() as uow:
        todo = await uow.todos.find_by_id(todo_id=todo_uuid)
        if not todo:
          return None
        todo_title = todo.title
        todo_content = todo.content
        agents = [self.__copy_agent(agent) for agent in await uow.agents.get_all()]

      if not agents:
        await self.__fail_assignment(todo_id, reason="할당 가능한 에이전트가 없습니다")
        return None

      agent_list = [{a.name: a.system_prompt} for a in agents]
      user_message = {
        "TODO 정보": {"제목": todo_title, "내용": todo_content},
        "사용 가능한 에이전트": agent_list,
      }
      print(user_message)
      result, reason = await self.orchestration_agent.ainvoke(json.dumps(user_message))

      if result is None:
        await self.__fail_assignment(todo_id, reason=reason)
        return None

      selected = next((a for a in agents if a.name == result.name), None)
      if selected is None:
        await self.__fail_assignment(todo_id, reason=reason)
        return None

      async with self.unit_of_work_factory() as uow:
        await uow.todos.assign_agent(todo_id=UUID(todo_id), agent_name=selected.name)
        await uow.commit()
        return selected
    except Exception as e:
      print("select_and_assign exception", e)
      await self.__fail_assignment(todo_id, reason=str(e))
      return None

  async def execute_and_complete(self, todo_id: str, agent: AgentEntity) -> None:
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

    except Exception as e:
      print("execute_and_complete exception", e)
      raise e
