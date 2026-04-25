# 코딩 컨벤션 — Backend

<!--
작성 원칙:
- 비직관적이거나 팀/프로젝트 고유한 패턴만 기술한다.
- 프레임워크 기본 동작과 동일한 내용은 생략한다.
- 패턴이 없는 항목은 줄 자체를 추가하지 않는다.
- 코드 예시는 "왜 이렇게 해야 하는가"가 글로 설명하기 어려울 때만 포함한다.
- 타임스탬프, 출처 주석, [기본값] 레이블은 포함하지 않는다.
-->

## 테스트

테스트는 역할별로 레이어를 분리한다.

| 레이어 | 파일 위치 | mock 대상 | DB |
|--------|-----------|-----------|-----|
| Router | `src/routers/test_*.py` | Service (`AsyncMock(spec=Service)`) | 없음 |
| Service | `src/services/test_*.py` | Repository, Agent (`AsyncMock(spec=...)`) | 없음 |
| Agent | `src/agents/test_*.py` | LangChain `create_agent` (`@patch`) | 없음 |
| Repository | `src/repositories/test_*.py` | 없음 | in-memory SQLite |
| Publisher | `src/pubs/test_*.py` | asyncio.Queue (실제 Queue 사용) | 없음 |
| Listener | `src/listeners/test_*.py` | Repository, OrchestrationService, SSEManager, async_session_factory | 없음 |
| SSEManager | `src/sse/test_*.py` | 없음 (순수 단위 테스트) | 없음 |
| SSE Router | `src/routers/test_sse_*.py` | SSEManager (`MagicMock(spec=SSEManager)`) | 없음 |
| CORS/앱 설정 | `src/test_cors.py` | Service (ASGITransport, 미들웨어 포함 앱) | 없음 |

**공통**
- 구조: pytest 함수 기반, 테스트명 한국어 문장형
- `sut` 변수명으로 테스트 대상 인스턴스 생성
- 모든 테스트 함수·fixture에 반환 타입 명시 (`-> None`, `-> AsyncMock` 등)

**Router 테스트**
- 네이밍: `test_HTTP메서드_resource_한국어설명` (예: `test_DELETE_agents_에이전트를_삭제하고_204를_반환한다`)
- `AsyncMock(spec=AgentService)` fixture → `app.dependency_overrides[Service] = lambda: mock`
- 응답 상태코드와 body만 검증

**Service 테스트**
- 네이밍: `test_메서드명_한국어설명` (예: `test_create_agent_레포지토리_create_함수를_호출한다`)
- 테스트 쌍으로 작성: "레포지토리 호출 검증" + "반환값 검증"
- 반환값 검증 테스트는 반환 객체의 **모든 공개 필드**를 assert한다. 일부만 검증하면 새 필드 누락을 감지하지 못한다.
- Repository mock 반환값은 반드시 ORM `Entity` 객체로 설정한다. Pydantic `Response`를 반환하면 Service 내부 UUID 변환이 실패한다.
- ORM `relationship`이 있는 Entity를 mock으로 반환할 때는 `make_*_entity()` factory helper로 관계 필드를 직접 초기화한다. SQLAlchemy lazy loading은 mock 환경에서 동작하지 않는다.
```python
def make_agent_entity(index: Number, agent_id: uuid.UUID, tool_ids: list[str] | None = None) -> AgentEntity:
    entity = AgentEntity(id=str(agent_id), name=f"에이전트{index}", description=f"설명{index}", system_prompt=f"프롬프트{index}")
    entity.tools = [AgentToolEntity(agent_id=str(agent_id), tool_id=tid) for tid in (tool_ids or [])]
    return entity
```
- Service가 내부적으로 `async_session_factory`를 호출하는 경우, `fake_session_factory`로 패치하고 Repository 클래스는 `return_value=mock`으로 패치한다.
```python
@asynccontextmanager
async def fake_session_factory() -> AsyncGenerator[AsyncMock, None]:
    yield AsyncMock()

with (
    patch("services.orchestration_service.get_task_agent", return_value=mock_task_agent),
    patch("services.orchestration_service.async_session_factory", fake_session_factory),
    patch("services.orchestration_service.TodoRepository", return_value=mock_todo_repo),
):
    sut = OrchestrationService(agent=mock_orchestration_agent)
    result = await sut.select_and_assign(todo_id)
```

**Repository 테스트**
- 네이밍: `test_메서드명_한국어설명` (예: `test_create_에이전트_정보를_저장할_수_있다`)
- `setup_test_db: AsyncSession` 픽스처로 세션 수령 (conftest `autouse=True`, in-memory SQLite)
- True/False 등 결과 분기가 있는 경우 `@pytest.mark.parametrize` 사용

**Agent 테스트**
- `create_agent` 기반 에이전트: `@patch("agents.*.create_agent")`로 교체, `ainvoke` 반환값을 `{"structured_response": ...}` 형태로 설정
- `get_llm()` 직접 사용 에이전트: `@patch("agents.*.get_llm")`으로 교체

**Listener 테스트**
- 무한 루프: `asyncio.Queue + queue.join()`으로 항목 하나 처리 후 `task.cancel()`로 종료

**SSE Router 테스트**
- `MagicMock(spec=SSEManager)` + `subscribe`가 미리 채운 `asyncio.Queue` 반환하도록 설정
- `"completed"` 이벤트가 스트림 종료를 트리거 → `await client.get()`으로 전체 응답 수집 가능

---

## 소스 코드

- 포맷: Ruff (import 정렬)
- 모든 공개 함수에 타입 힌트 필수 (`-> None` 포함)
- 제네릭 타입은 타입 인자를 반드시 명시한다. bare `dict` / `list` / `Queue` 금지 → `dict[str, Any]`, `asyncio.Queue[str]`, `list[AgentEntity]`
- 비동기 제너레이터 함수는 `AsyncGenerator[YieldType, None]` 반환 타입을 명시한다.
- import: `src/` 루트 기준 전체 모듈 경로 사용 (예: `from repositories.database import Base`)
- SSE 채널 이름은 반드시 `channels/channel_names.py`의 함수로 생성한다. 문자열 리터럴 직접 사용 금지.
- Service Entity→Response 변환이 여러 메서드에서 반복될 경우 `@staticmethod _to_response(entity)` 헬퍼로 추출한다.
