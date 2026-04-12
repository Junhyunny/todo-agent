import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

import models  # noqa: F401 — AgentModel을 Base.metadata에 등록
from app import app
from database import Base, get_session

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture(autouse=True)
async def setup_test_db():
  engine = create_async_engine(TEST_DATABASE_URL)
  async with engine.begin() as conn:
    await conn.run_sync(Base.metadata.create_all)

  session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

  async def override_get_session():
    async with session_factory() as session:
      yield session

  app.dependency_overrides[get_session] = override_get_session
  yield session_factory
  app.dependency_overrides.clear()
  await engine.dispose()
