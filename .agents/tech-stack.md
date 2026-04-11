# 프로젝트 기술 스택

> **관리 스킬:** /sync-tech-stack
> **생성:** 2026-04-12
> **마지막 업데이트:** 2026-04-12 (sync)

---

## 스택 요약

| 영역 | 경로 | 스택 | 언어 | 빌드 도구 | Unit Test | E2E |
|------|------|------|------|----------|-----------|-----|
| Frontend | `frontend/` | TypeScript + React + Electron | TypeScript | npm (electron-forge) | Vitest + React Testing Library | — |
| Agent | `agent/` | Python + LangChain/LangGraph | Python | pip | — | Playwright |

---

## Frontend

- **Path:** `frontend/`
- **Stack:** TypeScript + React + Electron
- **Language:** TypeScript
- **Build tool:** npm (electron-forge)
- **Unit test framework:** Vitest + React Testing Library
- **E2E framework:** —
- **Source roots:** `frontend/src/`, `frontend/src/windows/`, `frontend/src/components/`
- **Test roots:** `frontend/src/` (co-located), `frontend/src/windows/` (co-located)
- **Detection signals:** `frontend/package.json` — react ^19, typescript ^6, vitest ^4, @testing-library/react ^16, electron ^41, react-router ^7 (HashRouter 사용 중)
- **Status:** detected

---

## Agent

- **Path:** `agent/`
- **Stack:** Python + LangChain/LangGraph
- **Language:** Python
- **Build tool:** pip
- **Unit test framework:** —
- **E2E framework:** Playwright
- **Source roots:** `agent/src/`
- **Test roots:** —
- **Detection signals:** `agent/requirements.txt` — langchain, langgraph, playwright, pydantic
- **Status:** detected

---

## Manual Notes
