# 기술 스택

## Frontend — `frontend/`
- **언어/프레임워크:** TypeScript + React + Electron + Tailwind v4 + shadcn/ui
- **빌드:** npm (electron-forge)
- **테스트:** Vitest + React Testing Library (co-located `*.test.tsx`)
- **API 클라이언트:** orval 자동생성 → `src/api/generated/agents.ts` (axios 기반, `spec/openapi.yaml` 원본)
- **소스 경로:** `frontend/src/`
- **UI 컴포넌트:** `src/components/ui/` (shadcn/ui)
- **윈도우 컴포넌트:** `src/windows/`

## Backend — `backend/`
- **언어/프레임워크:** Python + FastAPI + SQLAlchemy + SQLite + LangChain/LangGraph
- **빌드:** pip
- **테스트:** pytest + pytest-asyncio + httpx (AsyncClient), co-located `test_*.py`
- **소스 경로:** `backend/src/`
- **실행:** Electron main process가 앱 시작 시 uvicorn을 child_process로 자동 실행
