# todo-agent

AI 에이전트를 등록·관리하고 태스크를 실행하는 Electron 데스크톱 앱.

---

## References

- 프로젝트 아키텍처 정보: @ARCHITECTURE.md
- 코드 컨벤션 정보: @CONVENTIONS.md

## Prohibited Actions

- .env 파일은 읽거나 출력하지 않는다.

## format and lint

```bash
# 프론트엔드 포맷과 린트
cd frontend && npm run check

# 백엔드 포맷과 린트
cd backend && make check

# 전체 프로젝트 전체 포맷과 린트
make format-lint
```

## Test Run

```bash
# 프론트엔드 특정 테스트 파일만 실행
cd frontend && npm run test -- src/components/AgentListSheet.test.tsx

# 프론트엔드 특정 테스트명으로 필터
cd frontend && npm run test -- -t "에이전트 이름"

# 백엔드 단일 테스트
cd backend && .venv/bin/pytest src/routers/test_agent_router.py -v

# 전체 프로젝트 테스트
make test-all
```

## Do Not Edit

- `frontend/src/api/generated/` — Orval이 `spec/openapi.yaml`에서 자동 생성. 수동 편집 금지.
- `spec/openapi.yaml` — FastAPI에서 자동 생성 (`make generate-spec`). 수동 편집 금지.

## Test File Boilerplate

React 테스트 파일은 최상단에 다음 주석이 필요하다 (Biome lint 회피):

```tsx
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
```

## API Spec Change Workflow

백엔드 엔드포인트 추가/변경 시 프론트엔드 클라이언트 재생성 순서:

```bash
cd backend && make generate-spec   # FastAPI → spec/openapi.yaml
cd frontend && npm run generate:api  # openapi.yaml → src/api/generated/
```
