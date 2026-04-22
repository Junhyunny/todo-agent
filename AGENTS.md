# todo-agent

AI 에이전트를 등록·관리하고 태스크를 실행하는 Electron 데스크톱 앱.

---

## References

- 프로젝트 아키텍처 정보: @ARCHITECTURE.md
- 코드 컨벤션 정보: @CONVENTIONS.md

## 풀스택 변경 범위 점검

**기능을 계획할 때, 컴포넌트가 필요로 하는 데이터가 백엔드 어느 레이어까지 영향을 미치는지 반드시 추적한다.**

프론트엔드 파일만 나열된 계획은 미완성이다. 누락된 백엔드 레이어는 런타임 오류로 이어진다.

### 점검 트리거

아래 중 하나라도 해당되면 전 레이어 점검을 수행한다:

- 컴포넌트가 기존에 없던 새 필드를 렌더링해야 한다
- API 응답 스키마(Response)가 변경된다
- DB 엔티티에 컬럼이 추가·변경된다

### 점검 순서: 컴포넌트 → DB

| 순서 | 레이어 | 확인 질문 |
|------|--------|-----------|
| 1 | `schemas/` | `{Domain}Response`에 필드가 선언되어 있는가? |
| 2 | `routers/` | Router의 `response_model`이 올바른가? |
| 3 | `services/` | Service가 해당 필드를 Response에 매핑하는가? |
| 4 | `repositories/` | Repository가 해당 필드를 읽거나 저장하는가? |
| 5 | `entities/` | DB 엔티티에 컬럼이 존재하는가? (없으면 마이그레이션 필요) |

백엔드 변경 후에는 아래 **API Spec Change Workflow**를 따라 프론트엔드 클라이언트를 반드시 재생성한다.

---

## 구현 원칙

구현 요청을 받으면 아래 순서로 진행한다.

1. **테스트 먼저 작성** — 구현할 동작을 테스트로 먼저 정의한다 (RED)
2. **최소 구현** — 테스트를 통과하는 최소한의 코드를 작성한다 (GREEN)
3. **리팩토링** — 테스트가 통과하는 상태에서 코드를 정리한다 (REFACTOR)

탐색적 구현(인터페이스가 미확정인 경우)이 불가피하면, 구현 직후 같은 작업 단위에서 테스트를 작성한다.
어떤 경우에도 구현 작업과 테스트 작성을 별개의 작업으로 분리하지 않는다.

## Definition of Done

새 함수·핸들러·메서드를 구현할 때 **테스트 없는 구현은 미완성**이다.
구현과 테스트는 같은 작업 단위 안에서 함께 작성한다.

구체적으로 아래 항목이 모두 충족될 때 구현이 완료된 것으로 간주한다.

- 구현한 동작마다 대응하는 테스트가 존재한다
- 콜백·이벤트 핸들러는 호출 여부와 **인자**를 함께 검증한다
- 반환 객체는 **모든 공개 필드**를 검증한다
- 엣지 케이스(값 없음, 오류 발생 등)가 있으면 해당 케이스도 테스트한다

테스트 대상에서 빠지기 쉬운 항목:

| 구현 항목 | 누락되기 쉬운 테스트 |
|-----------|----------------------|
| 콜백 (`onSave`, `onClose` 등) | 인자 검증 (`toHaveBeenCalledWith`) |
| 비동기 핸들러 (`onmessage`, `onerror`) | 핸들러 내부 동작 (state 변경, 메서드 호출) |
| 응답 객체에 필드 추가 | 새 필드를 포함한 반환값 검증 |
| 조건 분기 (`if not todo or not agents`) | 각 분기별 독립 테스트 |

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
