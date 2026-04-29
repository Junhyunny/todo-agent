import json
from uuid import UUID

from agents.orchestration_agent import OrchestrationAgent
from agents.task_agent import TaskAgent, get_task_agent
from entities.agent_entities import AgentEntity
from repositories.agent_repository import AgentRepository
from repositories.database import async_session_factory
from repositories.todo_repository import TodoRepository


class OrchestrationService:
  def __init__(self, agent: OrchestrationAgent) -> None:
    self.agent = agent
    self.task_agent: TaskAgent = get_task_agent()

  async def __fail_assignment(self, todo_id: str, reason: str | None = None) -> None:
    async with async_session_factory() as session:
      todo_repo = TodoRepository(session=session)
      await todo_repo.fail_todo(UUID(todo_id), reason=reason)

  async def select_and_assign(self, todo_id: str) -> AgentEntity | None:
    try:
      async with async_session_factory() as session:
        todo_repo = TodoRepository(session=session)
        agent_repo = AgentRepository(session=session)

        todo = await todo_repo.find_by_id(UUID(todo_id))
        agents = list(await agent_repo.get_all())

        if not todo or not agents:
          if todo:
            await self.__fail_assignment(todo_id, reason="할당 가능한 에이전트가 없습니다")
          return None

        agent_list = [{a.name: a.system_prompt} for a in agents]
        user_message = {
          "TODO 정보": {"제목": todo.title, "내용": todo.content},
          "사용 가능한 에이전트": agent_list,
        }
        print(user_message)
        result, reason = await self.agent.ainvoke(json.dumps(user_message))
        if result is None:
          await self.__fail_assignment(todo_id, reason=reason)
          return None

        selected = next((a for a in agents if a.name == result.name), None)
        if selected is None:
          await self.__fail_assignment(todo_id, reason=reason)
          return None

        await todo_repo.assign_agent(todo_id=UUID(todo_id), agent_name=selected.name)
        return selected
    except Exception as e:
      await self.__fail_assignment(todo_id, reason=str(e))
      return None

  async def execute_and_complete(self, todo_id: str, agent: AgentEntity) -> None:
    async with async_session_factory() as session:
      todo_repo = TodoRepository(session=session)

      todo = await todo_repo.find_by_id(UUID(todo_id))
      if todo is None:
        raise RuntimeError(f"todo {todo_id} not found")
      user_message = f"{todo.title}\n{todo.content}"
      tool_codes = [agent_tool.tool.code for agent_tool in agent.tools]
      result = await self.task_agent.ainvoke(system_prompt=agent.system_prompt, user_message=user_message, tool_codes=tool_codes)
      await todo_repo.complete_todo(UUID(todo_id), result=result)
