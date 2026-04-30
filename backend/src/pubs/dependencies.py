import asyncio
from typing import Annotated

from fastapi import Depends

from channels.dependencies import get_assignment_queue
from pubs.assignment_publisher import AssignmentPublisher


def get_assignment_publisher(
  queue: Annotated[asyncio.Queue[str], Depends(get_assignment_queue)],
) -> AssignmentPublisher:
  return AssignmentPublisher(queue=queue)
