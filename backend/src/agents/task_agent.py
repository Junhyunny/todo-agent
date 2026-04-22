from agents.large_language_model import get_llm


class TaskAgent:
  def __init__(self) -> None:
    self.llm = get_llm()

  async def ainvoke(self, system_prompt: str, user_message: str) -> str:
    response = await self.llm.ainvoke(
      [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message},
      ]
    )
    return response.content


def get_task_agent() -> TaskAgent:
  return TaskAgent()
