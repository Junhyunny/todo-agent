import asyncio
import sys
from logging.config import fileConfig
from pathlib import Path

from sqlalchemy.ext.asyncio import create_async_engine

from alembic import context

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

import models  # noqa: F401
from repositories.database import DATABASE_URL, Base

config = context.config
if config.config_file_name is not None:
  fileConfig(config.config_file_name)

target_metadata = Base.metadata


def do_run_migrations(connection):
  context.configure(connection=connection, target_metadata=target_metadata)
  with context.begin_transaction():
    context.run_migrations()


async def run_async_migrations():
  connectable = create_async_engine(DATABASE_URL)
  async with connectable.connect() as connection:
    await connection.run_sync(do_run_migrations)
  await connectable.dispose()


def run_migrations_online():
  asyncio.run(run_async_migrations())


run_migrations_online()
