import json
from types import TracebackType
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from agents.orchestration_agent import OrchestrationAgent
from agents.task_agent import TaskAgent
from entities.agent_entities import AgentEntity
from repositories.agent_repository import AgentRepository
from repositories.database import async_session_factory
from repositories.todo_repository import TodoRepository


class UnitOfWork:
  def __init__(self) -> None:
    self.session: AsyncSession | None = None
    self.todo_repository: TodoRepository
    self.agent_repository: AgentRepository

  async def __aenter__(self) -> "UnitOfWork":
    self.session = async_session_factory()
    self.todo_repository = TodoRepository(session=self.session)
    self.agent_repository = AgentRepository(session=self.session)
    return self

  async def __aexit__(
    self,
    exc_type: type[BaseException] | None,
    exc_val: BaseException | None,
    exc_tb: TracebackType | None,
  ) -> None:
    if self.session is None:
      return
    try:
      if exc_type:
        await self.session.rollback()
      else:
        await self.session.commit()
    finally:
      await self.session.close()


class OrchestrationService:
  def __init__(self, orchestration_agent: OrchestrationAgent, task_agent: TaskAgent) -> None:
    self.orchestration_agent = orchestration_agent
    self.task_agent = task_agent

  async def __fail_assignment(self, todo_id: str, reason: str | None = None) -> None:
    async with UnitOfWork() as uow:
      await uow.todo_repository.fail_todo(UUID(todo_id), reason=reason)

  async def select_and_assign(self, todo_id: str) -> AgentEntity | None:
    try:
      todo_uuid = UUID(todo_id)
      async with UnitOfWork() as uow:
        todo = await uow.todo_repository.find_by_id(todo_id=todo_uuid)
        agents = list(await uow.agent_repository.get_all())

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
      result, reason = await self.orchestration_agent.ainvoke(json.dumps(user_message))

      async with UnitOfWork() as uow:
        if result is None:
          await self.__fail_assignment(todo_id, reason=reason)
          return None
        selected = next((a for a in agents if a.name == result.name), None)
        if selected is None:
          await self.__fail_assignment(todo_id, reason=reason)
          return None
        await uow.todo_repository.assign_agent(todo_id=UUID(todo_id), agent_name=selected.name)
        return selected
    except Exception as e:
      print("select_and_assign exception", e)
      await self.__fail_assignment(todo_id, reason=str(e))
      return None

  async def execute_and_complete(self, todo_id: str, agent: AgentEntity) -> None:
    try:
      async with UnitOfWork() as uow:
        todo = await uow.todo_repository.find_by_id(UUID(todo_id))
        if todo is None:
          raise RuntimeError(f"todo {todo_id} not found")

      user_message = f"{todo.title}\n{todo.content}"
      tool_codes = [agent_tool.tool.code for agent_tool in agent.tools]
      result = await self.task_agent.ainvoke(system_prompt=agent.system_prompt, user_message=user_message, tool_codes=tool_codes)

      async with UnitOfWork() as uow:
        await uow.todo_repository.complete_todo(UUID(todo_id), result=result)

    except Exception as e:
      print("execute_and_complete exception", e)
      raise e
