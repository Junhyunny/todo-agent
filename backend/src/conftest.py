from typing import AsyncGenerator

import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from repositories.database import Base

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture(autouse=True)
async def setup_test_db() -> AsyncGenerator[AsyncSession, None]:
  engine = create_async_engine(TEST_DATABASE_URL)
  async with engine.begin() as conn:
    await conn.run_sync(Base.metadata.create_all)

  session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
  async with session_factory() as session:
    yield session

  async with engine.begin() as conn:
    await conn.run_sync(Base.metadata.drop_all)
