# Architecture

<!--
작성 원칙:
- 구조·흐름·경계만 담는다.
- 배경 설명, 히스토리, TBD는 포함하지 않는다.
- 수정 금지 파일/폴더는 [수정 금지]로 명시한다.
-->

## Backend (`backend/src/`)

FastAPI 백엔드. Renderer → Backend 통신은 HTTP(Axios). 프론트엔드 구성은 ARCHITECTURE-FRONTEND.md 참조.

### 디렉터리 구조

```
backend/src/
  app.py              # FastAPI 앱 진입점, 라우터 등록, lifespan (백그라운드 리스너)
  conftest.py         # 테스트 공통 픽스처 (in-memory SQLite)
  export_spec.py      # OpenAPI spec 내보내기 스크립트
  routers/            # HTTP 엔드포인트 핸들러
  services/           # 비즈니스 로직 (orchestration_service 포함)
  repositories/       # DB 접근 (AsyncSession)
  entities/           # SQLAlchemy ORM 엔티티 ({Domain}Entity, 관계 매핑 엔티티 포함)
  schemas/            # Pydantic API 스키마 ({Domain}Request / {Domain}Response)
  models/             # LLM 관련 데이터 모델 (structured output 스키마)
  agents/             # LangChain 에이전트 (OrchestrationAgent, LLM 팩토리)
  channels/           # asyncio.Queue 싱글톤 + 채널 이름 함수
  pubs/               # Queue Publisher (assignment_publisher)
  listeners/          # Queue Listener (assignment_listener) — 백그라운드 태스크
  sse/                # SSE pub/sub 매니저 (in-memory)
backend/alembic/      # DB 마이그레이션 (versions/에 버전 파일 누적)
```

### 데이터 흐름

일반 요청:

```
HTTP Request
  → routers/{domain}_router.py
  → services/{domain}_service.py
  → repositories/{domain}_repository.py
  → AsyncSession → SQLite (todo-agent.db)
```

TODO 등록 시 비동기 에이전트 할당·실행 흐름:

```
POST /api/todos → TodoService → TodoRepository.create() → AssignmentPublisher.publish() → 즉시 응답

[백그라운드: AssignmentListener]
  → OrchestrationService.select_and_assign()
      → 실패 시: fail_assignment() → SSEManager.publish("failed")
  → SSEManager.publish("assigned")
  → OrchestrationService.execute_and_complete()
      → TaskAgent.ainvoke() → TodoRepository.complete_todo()
  → SSEManager.publish("completed")

GET /api/todos/{todo_id}/events (SSE) → SSEManager.subscribe() → stream until "completed"|"failed"
```

### DB 마이그레이션 워크플로우

`entities/` 엔티티에 변경이 있을 때 반드시 수행한다.

```
1. entities/ 엔티티 추가/변경
2. entities/__init__.py에 엔티티 import (Alembic 감지 필요)
3. alembic revision --autogenerate -m "<설명>"
4. cd backend && make migrate
```

마이그레이션 없이 앱을 실행하면 테이블이 없어 런타임 오류가 발생한다.

### 레이어 아키텍처

```
Router → Service → Repository → AsyncSession (SQLite)
                 ↘ Publisher → Queue → Listener → OrchestrationService → Repository (async_session_factory)
                                                                       ↘ OrchestrationAgent (LLM 선택)
                                                                       ↘ TaskAgent (LLM 실행)
                                              ↘ SSEManager → SSE Router
```

- **Router/Service/Repository:** `Depends()`로 DI 연결. Service는 AssignmentPublisher도 주입받아 큐 적재
- **entities/:** SQLAlchemy ORM 엔티티. 관계 테이블은 `{Domain}MappingEntity`로 별도 파일 정의. 신규 엔티티는 `entities/__init__.py`에 import 필수 (Alembic 감지)
- **schemas/:** `{Domain}Request` / `{Domain}Response` (Pydantic)
- **agents/:** `OrchestrationAgent` — structured output으로 에이전트 선택. `TaskAgent` — `get_llm()` 직접 호출로 TODO 실행
- **channels/:** asyncio.Queue 싱글톤 + 채널 이름 함수 (`TODO_STATUS_CHANNEL`)
- **listeners/:** `app.py` lifespan에서 시작하는 백그라운드 태스크. `OrchestrationService`에 위임 후 SSE 발행
- **services/orchestration_service.py:** `async_session_factory`를 직접 호출해 per-operation 세션 관리

### 풀스택 변경 범위 점검

새 필드 렌더링·API 응답 변경·DB 컬럼 변경 시 아래 레이어를 전부 점검한다.

| 레이어 | 확인 항목 |
|--------|-----------|
| `schemas/` | `{Domain}Response`에 필드 선언 |
| `routers/` | `response_model` 올바름 |
| `services/` | Response에 필드 매핑 |
| `repositories/` | 필드 읽기·저장 |
| `entities/` | 컬럼 존재 (없으면 마이그레이션) |

백엔드 변경 후 `make generate-spec` → `npm run generate:api`로 프론트엔드 클라이언트를 재생성한다.

### 경계

| 금지 | 이유 | 대안 |
|------|------|------|
| `spec/openapi.yaml` 직접 수정 | FastAPI 자동생성 | `make generate-spec` 실행 |
| PYTHONPATH 없이 직접 실행 | `src/` 루트 기준 import | `make run` 또는 `PYTHONPATH=src` 명시 |
| 마이그레이션 없이 엔티티 변경 배포 | 테이블 부재로 런타임 오류 | 엔티티 변경 후 반드시 `cd backend && make migrate` 실행 |
| `entities/`에 Pydantic 스키마 정의 | ORM·API 스키마 혼재 | Pydantic 스키마는 `schemas/`에 작성 |
| `schemas/`에 SQLAlchemy 모델 정의 | ORM·API 스키마 혼재 | ORM 엔티티는 `entities/`에 작성 |

---

## Notes

<!-- 팀이 직접 관리하는 보조 메모. sync-architecture가 덮어쓰지 않는다. -->
