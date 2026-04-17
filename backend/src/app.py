from fastapi import FastAPI

from routers.agent_router import router as agent_router
from routers.todo_router import router as todo_router

app = FastAPI()
app.include_router(agent_router)
app.include_router(todo_router)
