import uuid
from unittest.mock import AsyncMock

import pytest

from entities import ToolEntity
from repositories.tool_repository import ToolRepository
from repositories.unit_of_work import AbstractUnitOfWork
from services.tool_service import ToolService


@pytest.fixture
def mock_tool_repository() -> AsyncMock:
  return AsyncMock(spec=ToolRepository)


@pytest.fixture
def mock_unit_of_work(mock_tool_repository: AsyncMock) -> AsyncMock:
  unit_of_work = AsyncMock(spec=AbstractUnitOfWork)
  unit_of_work.tools = mock_tool_repository
  unit_of_work.__aenter__.return_value = unit_of_work
  return unit_of_work


async def test_get_tools_레포지토리_get_all_함수를_호출한다(mock_unit_of_work: AsyncMock) -> None:
  sut = ToolService(unit_of_work=mock_unit_of_work)

  await sut.get_tools()

  mock_unit_of_work.tools.get_all.assert_awaited_once_with()
  mock_unit_of_work.commit.assert_not_called()


async def test_get_tools_레포지토리를_통해_툴_리스트를_조회한다(mock_unit_of_work: AsyncMock) -> None:
  expected_id_1 = uuid.uuid4()
  expected_id_2 = uuid.uuid4()
  mock_unit_of_work.tools.get_all.return_value = [
    ToolEntity(id=str(expected_id_1), name="툴 1", code="TOOL_1"),
    ToolEntity(id=str(expected_id_2), name="툴 2", code="TOOL_2"),
  ]
  sut = ToolService(unit_of_work=mock_unit_of_work)

  result = await sut.get_tools()

  assert len(result) == 2
  assert result[0].id == expected_id_1
  assert result[0].name == "툴 1"
  assert result[1].id == expected_id_2
  assert result[1].name == "툴 2"
