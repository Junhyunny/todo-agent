import asyncio
from typing import Any


class SSEManager:
  def __init__(self) -> None:
    self._subscribers: dict[str, asyncio.Queue[dict[str, Any]]] = {}

  def subscribe(self, channel_name: str) -> asyncio.Queue[dict[str, Any]]:
    q: asyncio.Queue[dict[str, Any]] = asyncio.Queue()
    self._subscribers[channel_name] = q
    return q

  def unsubscribe(self, channel_name: str) -> None:
    self._subscribers.pop(channel_name, None)

  async def publish(self, channel_name: str, data: dict[str, Any]) -> None:
    if channel_name in self._subscribers:
      await self._subscribers[channel_name].put(data)


sse_manager = SSEManager()


def get_sse_manager() -> SSEManager:
  return sse_manager
