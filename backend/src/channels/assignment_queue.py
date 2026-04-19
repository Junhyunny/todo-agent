import asyncio

_queue: asyncio.Queue[str] = asyncio.Queue()


def get_assignment_queue() -> asyncio.Queue[str]:
  return _queue
