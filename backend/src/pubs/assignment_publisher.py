import asyncio


class AssignmentPublisher:
  def __init__(self, queue: asyncio.Queue[str]) -> None:
    self.queue = queue

  async def publish(self, todo_id: str) -> None:
    await self.queue.put(todo_id)
