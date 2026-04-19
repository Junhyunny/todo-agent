import asyncio
from typing import Annotated

from fastapi import Depends

from channels.assignment_queue import get_assignment_queue


class AssignmentPublisher:
  def __init__(self, queue: asyncio.Queue[str]) -> None:
    self.queue = queue

  async def publish(self, todo_id: str) -> None:
    await self.queue.put(todo_id)


def get_assignment_publisher(
  queue: Annotated[asyncio.Queue[str], Depends(get_assignment_queue)],
) -> AssignmentPublisher:
  return AssignmentPublisher(queue=queue)
