# Architecture

<!--
작성 원칙:
- 구조·흐름·경계만 담는다.
- 배경 설명, 히스토리, TBD는 포함하지 않는다.
- 수정 금지 파일/폴더는 [수정 금지]로 명시한다.
-->

## Backend (`backend/`)

FastAPI 백엔드 영역이다. 전체 프로세스 구성과 Frontend → Backend 계약은 `ARCHITECTURE.md`를 따른다. 앱 lifespan에서 TODO assignment listener를 백그라운드 태스크로 시작한다.

### 디렉터리 구조

```
backend/
  Makefile            # run, test, check, migrate, generate-spec
  pyproject.toml      # pytest, mypy, ruff 설정
  requirements.txt    # Python dependency pin
  alembic/
    env.py            # Base.metadata 로드, async migration 실행
    versions/         # DB 마이그레이션 파일
  src/
    app.py            # FastAPI 앱, CORS, 라우터 등록, lifespan listener
    conftest.py       # 테스트 공통 픽스처
    export_spec.py    # OpenAPI spec 내보내기
    routers/          # HTTP/SSE 엔드포인트
    services/         # 비즈니스 로직과 서비스 DI factory
    repositories/     # SQLAlchemy repository, database, repository DI factory
    entities/         # SQLAlchemy ORM 엔티티와 Alembic import entry
    schemas/          # Pydantic API 스키마
    agents/           # LangChain OrchestrationAgent, TaskAgent, LLM factory
    models/           # LLM structured output, tool code 모델
    tools/            # ToolFactory, ToolProvider, Playwright toolkit provider
    channels/         # assignment queue singleton, channel name 함수
    pubs/             # assignment queue publisher
    listeners/        # assignment listener 백그라운드 루프
    sse/              # in-memory SSE manager와 singleton dependency
```

### 데이터 흐름

일반 요청:

```
HTTP Request
  → routers/{agent,todo,tool}_router.py
  → services.dependencies.get_{domain}_service()
  → services/{domain}_service.py
  → repositories.dependencies.get_{domain}_repository()
  → repositories/{domain}_repository.py
  → repositories.database.get_session()
  → AsyncSession → DB (DATABASE_URL)
```

TODO 등록 시 비동기 에이전트 할당·실행 흐름:

```
POST /api/todos → TodoService → TodoRepository.create() → AssignmentPublisher.publish() → 즉시 응답

[백그라운드: AssignmentListener]
  → OrchestrationService.select_and_assign()
      → 실패 시: fail_assignment() → SSEManager.publish("failed")
  → SSEManager.publish("assigned")
  → OrchestrationService.execute_and_complete()
      → TaskAgent.ainvoke()
      → ToolFactory.create_tools(tool_codes)
      → TodoRepository.complete_todo()
  → SSEManager.publish("completed")

GET /api/todos/{todo_id}/events (SSE) → SSEManager.subscribe() → stream; router loop breaks on "completed", frontend closes on "completed"|"failed"
```

TODO 재할당 흐름:

```
POST /api/todos/{todo_id}/reassign
  → TodoService.reassign_todo()
  → TodoRepository.reset_to_pending()  (status=PENDING, assigned_agent_name=None, result=None)
  → AssignmentPublisher.publish() → 즉시 응답

이후 흐름은 TODO 등록과 동일 (AssignmentListener → OrchestrationService → SSE)
```

LLM·툴 실행 흐름:

```
OrchestrationService
  → OrchestrationAgent.ainvoke() (structured output으로 agent 선택)
  → TaskAgent.ainvoke()
  → ToolFactory.create_tools()
  → ToolProvider.get_tools()
  → LangChain agent
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
Router → Service → Repository → AsyncSession → DB
       ↘ SSEManager → StreamingResponse
Service → AssignmentPublisher → Queue → AssignmentListener → OrchestrationService → UnitOfWork → Repository
                                                              ↘ OrchestrationAgent → LLM
                                                              ↘ TaskAgent → ToolFactory → ToolProvider
```

```
dependencies.py modules → FastAPI Depends providers 또는 process singleton accessor
```

- **routers/:** 요청 파싱, status code, `Depends()` 연결만 담당
- **services/:** 비즈니스 흐름. TODO Service는 AssignmentPublisher로 큐 적재
- **repositories/:** AsyncSession 기반 DB 접근. 커밋은 repository 메서드 또는 UnitOfWork에서 수행
- **entities/:** SQLAlchemy ORM 엔티티. 관계 테이블은 별도 엔티티 파일로 정의. 신규 엔티티는 `entities/__init__.py`에 import 필수 (Alembic 감지)
- **schemas/:** `{Domain}Request` / `{Domain}Response` (Pydantic)
- **agents/:** `OrchestrationAgent`는 structured output으로 에이전트를 선택. `TaskAgent`는 선택된 툴과 함께 TODO 실행
- **tools/:** tool code를 ToolProvider로 변환. Playwright provider는 브라우저 툴 생성·정리 담당
- **channels/:** asyncio.Queue 싱글톤 + 채널 이름 함수 (`TODO_STATUS_CHANNEL`)
- **listeners/:** `app.py` lifespan에서 시작하는 백그라운드 태스크. OrchestrationService 위임 후 SSE 발행
- **sse/:** channel별 in-memory subscriber queue 관리
- **dependencies.py:** 각 패키지의 DI provider. `channels/`와 `sse/`는 process singleton accessor

### 풀스택 변경 범위 점검

새 필드 렌더링·API 응답 변경·DB 컬럼 변경 시 아래 레이어를 전부 점검한다.

| 레이어 | 확인 항목 |
|--------|-----------|
| `schemas/` | `{Domain}Response`에 필드 선언 |
| `routers/` | 응답 타입 선언 또는 `response_model` 올바름 |
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
| Router에서 repository 직접 생성 | DI·테스트 override 우회 | `services.dependencies` provider 추가 |
| Background task에서 FastAPI request-scoped session 사용 | lifespan task는 request scope 밖에서 실행 | `UnitOfWork` 또는 명시적 `async_session_factory` 사용 |

---

## Notes

<!-- 팀이 직접 관리하는 보조 메모. sync-architecture가 덮어쓰지 않는다. -->
