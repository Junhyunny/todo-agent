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
  lib/              # 공통 유틸리티
```

### 데이터 흐름

```
FastAPI 엔드포인트 변경
  → make generate-spec → spec/openapi.yaml  [수정 금지]
  → npm run generate:api → src/api/generated/agents.ts  [수정 금지]
  → src/repository/agent-repository.ts (named export 래퍼)
  → components
```

렌더러 컴포넌트 내 API 호출 경로:

```
Component → repository/{domain}-repository.ts → api/generated/agents.ts → HTTP → Backend
```

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
  app.py              # FastAPI 앱 진입점, 라우터 등록
  conftest.py         # 테스트 공통 픽스처 (in-memory SQLite)
  export_spec.py      # OpenAPI spec 내보내기 스크립트
  routers/            # HTTP 엔드포인트 핸들러
  services/           # 비즈니스 로직
  repositories/       # DB 접근 (AsyncSession)
  models/             # SQLAlchemy ORM 모델 + Pydantic API 스키마
backend/alembic/      # DB 마이그레이션
```

### 데이터 흐름

```
HTTP Request
  → routers/agent_router.py
  → services/agent_service.py
  → repositories/agent_repository.py
  → AsyncSession → SQLite (todo-agent.db)
```

### 레이어 아키텍처

```
Router → Service → Repository → AsyncSession (SQLite)
```

- **Router:** 요청 파싱, 응답 직렬화. `Depends(Service)`로 Service 주입
- **Service:** 비즈니스 로직. `Depends(Repository)`로 Repository 주입
- **Repository:** DB CRUD. `Depends(get_session)`으로 `AsyncSession` 주입
- **models/:** `AgentModel` (SQLAlchemy ORM) + `AgentRequest/AgentResponse` (Pydantic 스키마)

DI는 FastAPI `Depends()`로 연결한다. `async_session_factory`는 모듈 레벨(전역) 생성, per-request `AsyncSession`을 yield한다.

### 경계

| 금지 | 이유 | 대안 |
|------|------|------|
| `spec/openapi.yaml` 직접 수정 | FastAPI 자동생성 | `make generate-spec` 실행 |
| PYTHONPATH 없이 직접 실행 | `src/` 루트 기준 import | `make run` 또는 `PYTHONPATH=src` 명시 |

---

## Notes

<!-- 팀이 직접 관리하는 보조 메모. sync-architecture가 덮어쓰지 않는다. -->
