import asyncio
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from agents.orchestration_agent import get_orchestration_agent
from channels.assignment_queue import get_assignment_queue
from listeners.assignment_listener import run_assignment_listener
from routers.agent_router import router as agent_router
from routers.sse_router import router as sse_router
from routers.todo_router import router as todo_router
from services.orchestration_service import OrchestrationService
from sse.manager import get_sse_manager


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
  listener = asyncio.create_task(
    run_assignment_listener(
      assign_que=get_assignment_queue(),
      orchestration_service=OrchestrationService(
        agent=get_orchestration_agent(),
      ),
      sse_manager=get_sse_manager(),
    )
  )
  yield
  listener.cancel()
  await asyncio.gather(listener, return_exceptions=True)


app = FastAPI(lifespan=lifespan)
app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
  allow_methods=["*"],
  allow_headers=["*"],
)
app.include_router(agent_router)
app.include_router(todo_router)
app.include_router(sse_router)

if "__main__" == __name__:
  import uvicorn

  uvicorn.run(app, host="127.0.0.1", port=8000)
