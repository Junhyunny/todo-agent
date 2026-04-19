import json

from agents.orchestration_agent import OrchestrationAgent
from entities import TodoEntity
from entities.agent_entities import AgentEntity


class OrchestrationService:
  def __init__(self, agent: OrchestrationAgent) -> None:
    self.agent = agent

  async def select_agent(
    self,
    todo: TodoEntity,
    agents: list[AgentEntity],
  ) -> str | None:
    agent_list = [{a.name: a.system_prompt} for a in agents]
    user_message = {
      "TODO 정보": {
        "제목": todo.title,
        "내용": todo.content,
      },
      "사용 가능한 에이전트": agent_list,
    }
    print(user_message)
    result = await self.agent.ainvoke(json.dumps(user_message))
    if result is None:
      return None
    return result.name
