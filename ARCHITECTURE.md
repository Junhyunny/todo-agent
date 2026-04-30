# Architecture

<!--
작성 원칙:
- 구조·흐름·경계만 담는다.
- 배경 설명, 히스토리, TBD는 포함하지 않는다.
- 수정 금지 파일/폴더는 [수정 금지]로 명시한다.
-->

## 전체 구조

AI 에이전트를 등록·관리하고 TODO를 실행하는 Electron 데스크톱 앱이다. 프론트엔드와 백엔드는 독립 프로세스로 실행한다.

- `make start-backend` — FastAPI + uvicorn (`127.0.0.1:8000`)
- `make start-frontend` — Electron Forge + Vite + React

Renderer → Backend 통신은 REST API(Axios)와 TODO 상태 SSE(EventSource)를 사용한다. Electron IPC는 현재 사용하지 않는다.

### 영역

| 영역 | 문서 | 스택 |
|------|------|------|
| `frontend/` | `ARCHITECTURE-FRONTEND.md` | Electron Forge, Vite, React, Orval, Vitest |
| `backend/` | `ARCHITECTURE-BACKEND.md` | FastAPI, SQLAlchemy async, Alembic, LangChain, pytest |

### 공통 데이터 흐름

```
Renderer UI
  → repository wrapper
  → frontend/src/api/generated/agents.ts  [수정 금지]
  → HTTP /api/*
  → FastAPI router
```

```
FastAPI app/schema 변경
  → cd backend && make generate-spec
  → spec/openapi.yaml  [수정 금지]
  → cd frontend && npm run generate:api
  → frontend/src/api/generated/agents.ts  [수정 금지]
```

TODO 생성·재할당 후 상태 동기화:

```
Backend assignment listener
  → SSEManager.publish()
  → GET /api/todos/{todo_id}/events
  → frontend/src/utils/sse-handler.ts
  → MainWindow refetch
```

### 경계

| 금지 | 이유 | 대안 |
|------|------|------|
| `.env*` 파일 읽기·출력 | 비밀값 포함 가능 | 코드·문서·테스트에서 필요한 키 이름만 확인 |
| `spec/openapi.yaml` 직접 수정 | FastAPI에서 생성되는 공유 계약 | `cd backend && make generate-spec` |
| `frontend/src/api/generated/` 직접 수정 | Orval 자동생성 클라이언트 | `cd frontend && npm run generate:api` |

---

## Notes

<!-- 팀이 직접 관리하는 보조 메모. sync-architecture가 덮어쓰지 않는다. -->
