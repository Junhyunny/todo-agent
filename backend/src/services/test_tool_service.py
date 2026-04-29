import uuid
from unittest.mock import AsyncMock

import pytest

from entities import ToolEntity
from repositories.tool_repository import ToolRepository
from services.tool_service import ToolService


@pytest.fixture
def mock_tool_repository() -> AsyncMock:
  return AsyncMock(spec=ToolRepository)


async def test_get_tools_레포지토리_get_all_함수를_호출한다(mock_tool_repository: AsyncMock) -> None:
  sut = ToolService(tool_repository=mock_tool_repository)

  await sut.get_tools()

  mock_tool_repository.get_all.assert_called_once()


async def test_get_tools_레포지토리를_통해_툴_리스트를_조회한다(mock_tool_repository: AsyncMock) -> None:
  expected_id_1 = uuid.uuid4()
  expected_id_2 = uuid.uuid4()
  mock_tool_repository.get_all.return_value = [
    ToolEntity(id=str(expected_id_1), name="툴 1", code="TOOL_1"),
    ToolEntity(id=str(expected_id_2), name="툴 2", code="TOOL_2"),
  ]
  sut = ToolService(tool_repository=mock_tool_repository)

  result = await sut.get_tools()

  assert len(result) == 2
  assert result[0].id == expected_id_1
  assert result[0].name == "툴 1"
  assert result[1].id == expected_id_2
  assert result[1].name == "툴 2"
