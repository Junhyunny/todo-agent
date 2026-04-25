from fastapi import APIRouter, Depends
from starlette import status

from schemas.tool_api_schema import ToolResponse
from services.tool_service import ToolService

router = APIRouter()


@router.get("/api/tools", status_code=status.HTTP_200_OK)
async def get_tools(tool_service: ToolService = Depends(ToolService)) -> list[ToolResponse]:
  return await tool_service.get_tools()
