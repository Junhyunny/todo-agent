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
  entities/           # SQLAlchemy ORM 엔티티 ({Domain}Entity)
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
POST /api/todos
  → TodoService.create_todo()
      → TodoRepository.create()        # DB 저장 (status: pending)
      → AssignmentPublisher.publish()  # asyncio.Queue에 todo_id 적재
      → TodoResponse 즉시 반환

[백그라운드: AssignmentListener]
  Queue.get(todo_id)
  → OrchestrationService.select_and_assign(todo_id)
      → TodoRepository.find_by_id()       # 내부에서 async_session_factory 사용
      → AgentRepository.get_all()
      → OrchestrationAgent.ainvoke()      # LangChain structured output → 에이전트 선택
      → (에이전트 없거나 선택 실패) OrchestrationService.fail_assignment()
          → TodoRepository.fail_todo()    # status: failed
          → AgentEntity | None 반환
  → (None이면) SSEManager.publish(TODO_STATUS_CHANNEL(todo_id), {"type": "failed", ...}) → 루프 계속
  → SSEManager.publish(TODO_STATUS_CHANNEL(todo_id), {"type": "assigned", ...})
  → OrchestrationService.execute_and_complete(todo_id, agent)
      → TodoRepository.find_by_id()       # 내부에서 async_session_factory 사용
      → TaskAgent.ainvoke()               # system_prompt + todo 내용 → LLM 응답
      → TodoRepository.complete_todo()    # status: completed, result 저장
  → SSEManager.publish(TODO_STATUS_CHANNEL(todo_id), {"type": "completed", ...})

GET /api/todos/{todo_id}/events  (SSE)
  → SSEManager.subscribe(TODO_STATUS_CHANNEL(todo_id)) → stream until "completed" or "failed" 이벤트
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

- **Router:** 요청 파싱, 응답 직렬화. `Depends(Service)`로 Service 주입
- **Service:** 비즈니스 로직. `Depends(Repository)`로 Repository 주입. AssignmentPublisher도 주입받아 큐에 적재
- **Repository:** DB CRUD. `Depends(get_session)`으로 `AsyncSession` 주입
- **entities/:** `{Domain}Entity` (SQLAlchemy ORM). 신규 엔티티는 `entities/__init__.py`에 import해야 Alembic이 감지한다
- **schemas/:** `{Domain}Request` / `{Domain}Response` (Pydantic). Router에서 요청·응답 직렬화에 사용
- **models/:** LLM structured output 스키마 (`OrchestrationAgentMessage`, `TargetAgent`)
- **agents/:** LangChain 에이전트 두 종류. `OrchestrationAgent` — `create_agent` + structured output으로 에이전트 선택. `TaskAgent` — `get_llm()` 직접 호출로 TODO 실행
- **channels/:** `assignment_queue.py` (asyncio.Queue 싱글톤) + `channel_names.py` (채널 이름 생성 함수)
- **pubs/:** Queue에 메시지를 적재하는 Publisher. Service 레이어에서 주입
- **listeners/:** 큐를 소비해 `OrchestrationService`에 위임하고 SSE 이벤트를 발행하는 백그라운드 태스크. `app.py` lifespan에서 시작
- **sse/:** in-memory pub/sub 매니저. 채널 이름(`TODO_STATUS_CHANNEL(todo_id)`)으로 구독/발행. SSE Router에서 구독, Listener에서 발행
- **services/orchestration_service.py:** `OrchestrationAgent` 주입, `TaskAgent`는 팩토리(`get_task_agent()`)로 내부 생성. `async_session_factory`를 직접 호출해 per-operation 세션을 관리한다. `select_and_assign(todo_id)` → `AgentEntity | None` (에이전트 없거나 선택 실패 시 `fail_assignment()` 호출 후 `None` 반환), `fail_assignment(todo_id)` → `None` (status: failed 저장), `execute_and_complete(todo_id, agent)` → `None`

DI는 FastAPI `Depends()`로 연결한다. `async_session_factory`는 모듈 레벨(전역) 생성, per-request `AsyncSession`을 yield한다.

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
