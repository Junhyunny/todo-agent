# 프로젝트 기술 스택

> **관리 스킬:** /sync-tech-stack
> **생성:** 2026-04-12
> **마지막 업데이트:** 2026-04-14 (sync)

---

## 스택 요약

| 영역 | 경로 | 스택 | 언어 | 빌드 도구 | Unit Test | E2E |
|------|------|------|------|----------|-----------|-----|
| Frontend | `frontend/` | TypeScript + React + Electron + Tailwind v4 + shadcn/ui | TypeScript | npm (electron-forge) | Vitest + React Testing Library | — |

| Backend | `backend/` | Python + FastAPI + SQLAlchemy + SQLite + LangChain/LangGraph | Python | pip | pytest + pytest-asyncio + httpx | Playwright |

---

## Frontend

- **Path:** `frontend/`
- **Stack:** TypeScript + React + Electron + Tailwind v4 + shadcn/ui
- **Language:** TypeScript
- **Build tool:** npm (electron-forge)
- **Unit test framework:** Vitest + React Testing Library
- **E2E framework:** —
- **Source roots:** `frontend/src/`, `frontend/src/windows/`, `frontend/src/components/ui/`
- **Test roots:** `frontend/src/` (co-located), `frontend/src/windows/` (co-located)
- **Detection signals:** `frontend/package.json` — react ^19, typescript ^6, vitest ^4, @testing-library/react ^16, electron ^41, tailwindcss ^4.2.2, shadcn ^4.1.2, tailwind-merge ^3.5.0, clsx ^2.1.1, axios, orval, react-router
- **API client:** orval (generated from `spec/openapi.yaml` → `src/api/generated/agents.ts`, axios-based)
- **UI components:** `src/components/ui/button.tsx` (shadcn/ui 기반)
- **Status:** detected

---

## Backend

- **Path:** `backend/`
- **Stack:** Python + FastAPI + SQLAlchemy + SQLite + LangChain/LangGraph
- **Language:** Python
- **Build tool:** pip
- **Unit test framework:** pytest + pytest-asyncio + httpx (AsyncClient)
- **E2E framework:** Playwright
- **Source roots:** `backend/src/`
- **Test roots:** TBD (co-located 예정)
- **Detection signals:** `backend/requirements.txt` — SQLAlchemy 2.0, langchain, langgraph, playwright, pydantic
- **Pending dependencies:** fastapi, uvicorn[standard], aiosqlite, alembic, pytest, pytest-asyncio
- **Notes:**
  - FastAPI HTTP API + LangChain/LangGraph AI 에이전트 코드를 동일 디렉토리에서 관리
  - 에이전트 실행 API는 향후 BackgroundTasks / asyncio.Queue로 비동기 처리 필요
  - Electron main process가 앱 시작 시 uvicorn을 child_process로 자동 실행
- **Status:** detected (FastAPI 구성 예정)

---

## Manual Notes
