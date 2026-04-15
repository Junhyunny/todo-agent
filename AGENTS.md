# todo-agent

AI 에이전트를 등록·관리하고 태스크를 실행하는 Electron 데스크톱 앱.

---

## References

- 프로젝트 상세 스택 정보: @.agents/tech-stack.md
- 코딩 상세 규칙: @.agents/coding-conventions.md

## Prohibited Actions

- .env 파일은 읽거나 출력하지 않는다.

### Single Test Run

```bash
# 특정 테스트 파일만 실행
cd frontend && npm run test -- src/components/AgentListDialog.test.tsx

# 특정 테스트명으로 필터
cd frontend && npm run test -- -t "에이전트 이름"

# 백엔드 단일 테스트
cd backend && .venv/bin/pytest src/test_agents_router.py -v
```

### Do Not Edit

- `frontend/src/api/generated/` — Orval이 `spec/openapi.yaml`에서 자동 생성. 수동 편집 금지.
- `spec/openapi.yaml` — FastAPI에서 자동 생성 (`make generate-spec`). 수동 편집 금지.

### Test File Boilerplate

React 테스트 파일은 최상단에 다음 주석이 필요하다 (Biome lint 회피):

```tsx
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
```

### API Spec Change Workflow

백엔드 엔드포인트 추가/변경 시 프론트엔드 클라이언트 재생성 순서:

```bash
cd backend && make generate-spec   # FastAPI → spec/openapi.yaml
cd frontend && npm run generate:api  # openapi.yaml → src/api/generated/
```
