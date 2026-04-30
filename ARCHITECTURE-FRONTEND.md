# Architecture

<!--
작성 원칙:
- 구조·흐름·경계만 담는다.
- 배경 설명, 히스토리, TBD는 포함하지 않는다.
- 수정 금지 파일/폴더는 [수정 금지]로 명시한다.
-->

## 전체 구조

Electron Forge + Vite + React 렌더러 영역이다. 전체 프로세스 구성과 Frontend → Backend 계약은 `ARCHITECTURE.md`를 따른다.

- `frontend/src/main.ts` — Electron main process
- `frontend/src/preload.ts` — preload bridge (현재 공개 API 없음)
- `frontend/src/renderer.ts` → `frontend/src/main.tsx` → `frontend/src/App.tsx` — React renderer 진입

---

## Frontend (`frontend/`)

### 디렉터리 구조

```
frontend/
  package.json              # Electron Forge, Vite, Vitest, Orval scripts
  forge.config.ts           # Electron Forge 설정
  vite.renderer.config.ts   # React renderer, alias, Tailwind, API base URL, test 설정
  vite.main.config.ts       # Electron main Vite 설정
  vite.preload.config.ts    # preload Vite 설정
  orval.config.ts           # spec/openapi.yaml → src/api/generated/agents.ts
  src/
    main.ts                 # BrowserWindow 생성, preload 연결
    preload.ts              # preload bridge (현재 IPC 미사용)
    renderer.ts             # CSS와 React 앱 진입 import
    main.tsx                # React root render
    App.tsx                 # TooltipProvider + HashRouter
    windows/                # 페이지 단위 윈도우 컴포넌트
    components/             # 기능 UI 컴포넌트와 co-located 테스트
    components/ui/          # shadcn/ui 관리 컴포넌트  [수정 금지]
    repository/             # generated 클라이언트 named export 래퍼
    api/generated/          # Orval 자동생성 Axios 클라이언트  [수정 금지]
    types/                  # 공유 enum 정의
    utils/                  # 브라우저 유틸리티 (SSE 핸들러)
    lib/                    # shadcn/ui 헬퍼
    tests/                  # 테스트 전용 Provider 래퍼
```

### 데이터 흐름

렌더러 시작:

```
npm run start
  → Electron Forge + Vite
  → main.ts creates BrowserWindow
  → renderer.ts
  → main.tsx
  → App.tsx
  → windows/MainWindow.tsx
```

FastAPI 엔드포인트 변경:

```
Backend route/schema 변경
  → cd backend && make generate-spec
  → spec/openapi.yaml  [수정 금지]
  → cd frontend && npm run generate:api
  → src/api/generated/agents.ts  [수정 금지]
  → src/repository/{agent,todo,tool}-repository.ts
```

렌더러 컴포넌트 내 API 호출 경로:

```
windows/MainWindow.tsx 또는 components/*
  → repository/{agent,todo,tool}-repository.ts
  → api/generated/agents.ts
  → Axios /api/*
  → Backend
```

TODO 상태 SSE:

```
TodoRegistrationDialog 또는 MainWindow 재할당
  → createTodo()/reassignTodo()
  → Backend 즉시 응답
  → sseHandler(__API_BASE_URL__/api/todos/{todo_id}/events)
  → assigned/completed/failed 수신 시 getTodos() refetch
  → completed/failed 수신 시 EventSource close
```

`__API_BASE_URL__`은 `vite.renderer.config.ts`에서 `VITE_API_BASE_URL` 또는 `http://127.0.0.1:8000`으로 정의한다. REST 호출은 생성
클라이언트의 상대 경로 `/api/*`를 사용하며, Vite 개발 서버는 `/api`를 `http://localhost:8000`으로 프록시한다.

### 레이어 아키텍처

```
App(HashRouter) → windows/ → components/ → repository/ → api/generated/
                            ↘ utils/sse-handler.ts → EventSource
```

- **windows/:** 페이지 단위 최상위 컴포넌트. 라우터에서 직접 렌더링
- **components/:** Dialog, Sheet, ComboBox 등 기능 UI. API 호출은 repository 경유
- **repository/:** generated 클라이언트를 래핑하고 `response.data`를 반환. 클래스 금지, named export만 사용
- **api/generated/:** Orval이 `spec/openapi.yaml`로부터 자동 생성. 직접 수정 금지
- **utils/:** 브라우저 API 기반 유틸리티. `sse-handler.ts`가 EventSource 생명주기 관리

### 경계

| 금지                               | 이유                      | 대안                                              |
|----------------------------------|-------------------------|-------------------------------------------------|
| `src/api/generated/` 직접 수정       | Orval 자동생성. biome 검사 제외 | `spec/openapi.yaml` 생성 후 `npm run generate:api` |
| `src/components/ui/` 직접 수정       | shadcn/ui 관리            | `npx shadcn@latest add <name>`                  |
| renderer에서 Electron 모듈 직접 import | Electron process 경계 위반  | 필요한 API를 `preload.ts`에 노출                       |
| API 응답 타입을 수동 선언                 | OpenAPI 계약과 drift 발생    | `api/generated/agents.ts` 타입 재사용                |

---

## Notes

<!-- 팀이 직접 관리하는 보조 메모. sync-architecture가 덮어쓰지 않는다. -->
