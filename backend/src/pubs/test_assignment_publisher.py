import asyncio

from pubs.assignment_publisher import AssignmentPublisher


async def test_publish_todo_id를_큐에_적재한다() -> None:
  queue: asyncio.Queue[str] = asyncio.Queue()
  sut = AssignmentPublisher(queue=queue)

  await sut.publish("todo-123")

  assert queue.get_nowait() == "todo-123"
