from typing import Optional

from pydantic import BaseModel, Field


class TargetAgent(BaseModel):
  name: str = Field(description="에이전트 이름")
  system_prompt: str = Field(description="에이전트 시스템 프롬프트")


class OrchestrationAgentMessage(BaseModel):
  result: Optional[TargetAgent] = None
  is_applicable: bool
  reason: str
