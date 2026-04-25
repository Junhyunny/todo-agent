# todo-agent

AI 에이전트를 등록·관리하고 태스크를 실행하는 Electron 데스크톱 앱.

---

## References

- 프로젝트 아키텍처 Frontend: @ARCHITECTURE-FRONTEND.md
- 프로젝트 아키텍처 Backend: @ARCHITECTURE-BACKEND.md
- 코드 컨벤션 Frontend: @CONVENTIONS-FRONTEND.md
- 코드 컨벤션 Backend: @CONVENTIONS-BACKEND.md

## 구현 범위 준수

**AC에 명시된 동작만 구현한다. 아래 중 하나라도 해당하면 사용자에게 확인한다.**

- AC에 해당 기능이 없다
- 요청 레이어(화면·API·DB)를 벗어난다
- 기존 동작 코드를 수정하게 된다

예시 — "수정 다이얼로그에서 저장한 정보가 보인다":

| ✅ 포함 | ❌ 금지 |
|---------|---------|
| 수정 다이얼로그 필드 렌더링 | PUT/PATCH 엔드포인트 추가 |
| 기존 GET 응답에 필드 추가 | 저장 버튼 동작 구현 |

---

## 구현 원칙 (TDD)

1. 테스트 작성 → 최소 구현 → 리팩토링
2. 구현과 테스트는 같은 작업 단위 안에서 완성한다

**Definition of Done** — 아래 항목이 모두 충족돼야 완료:

- 구현한 동작마다 대응 테스트 존재
- 콜백·핸들러는 인자까지 검증 (`toHaveBeenCalledWith`)
- 반환 객체는 모든 공개 필드 검증
- 엣지 케이스(값 없음, 오류) 테스트 포함

---

## Commands

```bash
# 포맷 · 린트
make format-lint

# 타입 체크 (커밋 전 필수)
make typecheck-frontend

# 테스트
make test-all
cd frontend && npm run test -- <파일 or -t "테스트명">
cd backend && .venv/bin/pytest <파일> -v
```

## Do Not Edit

- `frontend/src/api/generated/` — Orval 자동 생성. 수동 편집 금지.
- `spec/openapi.yaml` — FastAPI 자동 생성. 수동 편집 금지.
- `.env` 파일 읽기·출력 금지.

## Test File Boilerplate

React 테스트 파일 최상단에 필요 (Biome lint 회피):

```tsx
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
```

## API Spec Change Workflow

백엔드 엔드포인트 추가/변경 후:

```bash
cd backend && make generate-spec     # FastAPI → spec/openapi.yaml
cd frontend && npm run generate:api  # openapi.yaml → src/api/generated/
```
