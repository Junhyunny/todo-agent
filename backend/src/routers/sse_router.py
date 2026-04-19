import json
from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from channels.channel_names import TODO_ASSIGN_CHANNEL
from sse.manager import SSEManager, get_sse_manager

router = APIRouter()


@router.get("/api/todos/{todo_id}/events")
async def todo_events(
  todo_id: str,
  sse_manager: Annotated[SSEManager, Depends(get_sse_manager)],
) -> StreamingResponse:
  async def event_generator() -> AsyncGenerator[str, None]:
    channel_name = TODO_ASSIGN_CHANNEL(todo_id)
    channel = sse_manager.subscribe(channel_name)
    try:
      while True:
        event = await channel.get()
        yield f"data: {json.dumps(event)}\n\n"
        if event.get("type") == "assigned":
          break
    finally:
      sse_manager.unsubscribe(channel_name)

  return StreamingResponse(event_generator(), media_type="text/event-stream")
