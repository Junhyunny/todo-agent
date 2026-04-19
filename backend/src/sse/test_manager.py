import asyncio

from sse.manager import SSEManager


async def test_subscribe_구독자_큐를_반환한다() -> None:
  sut = SSEManager()

  q = sut.subscribe("todo-1")

  assert isinstance(q, asyncio.Queue)


async def test_subscribe_동일한_id로_재구독하면_새_큐를_반환한다() -> None:
  sut = SSEManager()

  q1 = sut.subscribe("todo-1")
  q2 = sut.subscribe("todo-1")

  assert q1 is not q2


async def test_unsubscribe_구독을_해제한다() -> None:
  sut = SSEManager()
  sut.subscribe("todo-1")

  sut.unsubscribe("todo-1")

  await sut.publish("todo-1", {"type": "assigned"})  # 예외 없어야 한다


async def test_unsubscribe_구독하지_않은_id를_해제해도_예외가_발생하지_않는다() -> None:
  sut = SSEManager()

  sut.unsubscribe("non-existent")  # 예외 없어야 한다


async def test_publish_구독자의_큐에_데이터를_전달한다() -> None:
  sut = SSEManager()
  q = sut.subscribe("todo-1")

  await sut.publish("todo-1", {"type": "assigned", "agent_name": "검색 에이전트"})

  event = q.get_nowait()
  assert event == {"type": "assigned", "agent_name": "검색 에이전트"}


async def test_publish_구독자가_없으면_무시한다() -> None:
  sut = SSEManager()

  await sut.publish("non-existent", {"type": "assigned"})  # 예외 없어야 한다
