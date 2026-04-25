# Architecture

<!--
작성 원칙:
- 구조·흐름·경계만 담는다.
- 배경 설명, 히스토리, TBD는 포함하지 않는다.
- 수정 금지 파일/폴더는 [수정 금지]로 명시한다.
-->

## 전체 구조

Electron 데스크톱 앱으로, 두 개의 독립 프로세스를 수동으로 실행한다.

- `make start-backend` — FastAPI + uvicorn (`127.0.0.1:8000`)
- `make start-frontend` — Electron + Vite (React 렌더러)

Renderer → Backend 통신은 HTTP(Axios)만 사용한다. Electron IPC는 현재 미사용이다.

---

## Frontend (`frontend/src/`)

### 디렉터리 구조

```
frontend/src/
  main.ts           # Electron main process 진입점
  preload.ts        # preload 브리지 (IPC 미사용)
  renderer.ts       # 렌더러 진입점
  main.tsx          # React 앱 마운트
  App.tsx           # 라우터 루트 (HashRouter)
  windows/          # 최상위 윈도우 컴포넌트
  components/       # React UI 컴포넌트 (co-located *.test.tsx)
  components/ui/    # shadcn/ui 관리 컴포넌트  [수정 금지]
  repository/       # generated 클라이언트 named export 래퍼
  api/generated/    # orval 자동생성 Axios 클라이언트  [수정 금지]
  types/            # 공유 타입·enum 정의 (TodoStatus 등)
  utils/            # 공통 유틸리티 (SSE 핸들러 등)
  lib/              # 공통 유틸리티 (shadcn/ui 헬퍼)
  tests/            # 테스트 전용 유틸리티 (Provider 래퍼 등)
```

### 데이터 흐름

```
FastAPI 엔드포인트 변경
  → make generate-spec → spec/openapi.yaml  [수정 금지]
  → npm run generate:api → src/api/generated/agents.ts  [수정 금지]
  → src/repository/{domain}-repository.ts (named export 래퍼)
  → components
```

렌더러 컴포넌트 내 API 호출 경로:

```
Component → repository/{domain}-repository.ts → api/generated/agents.ts → HTTP → Backend
```

> `api/generated/agents.ts`는 모든 도메인(agent, todo 등)의 API를 단일 파일로 생성한다.

### 레이어 아키텍처

```
windows/ → components/ → repository/ → api/generated/
```

- **windows/:** 페이지 단위 최상위 컴포넌트. 라우터에서 직접 렌더링
- **components/:** 기능 단위 UI 컴포넌트. 비즈니스 로직 없이 repository만 호출
- **repository/:** generated 클라이언트를 래핑해 도메인 함수로 노출. 클래스 금지, named export만 사용
- **api/generated/:** orval이 `spec/openapi.yaml`로부터 자동 생성. 직접 수정 금지

### 경계

| 금지 | 이유 | 대안 |
|------|------|------|
| `src/api/generated/` 직접 수정 | orval 자동생성 | `spec/openapi.yaml` 수정 후 `npm run generate:api` |
| `src/components/ui/` 직접 수정 | shadcn/ui 관리 | `npx shadcn@latest add <name>` |
| renderer에서 Electron 모듈 직접 import | Electron 경계 위반 | preload API 경유 |

---

## Backend (`backend/src/`)

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
3. alembic revision --autogenerate -m "<설명>"  # 마이그레이션 파일 생성
4. cd backend && make migrate                    # alembic upgrade head 실행
```

> 마이그레이션 없이 앱을 실행하면 테이블이 없어 런타임 오류가 발생한다.

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
