# 태스크 계획 템플릿

Phase 2(협업 계획) 종료 시 생성됩니다. 초기 태스크 분류를 제시할 때와 각 수정 후 대화에 표시하세요.

---

## 태스크 계획 형식

```markdown
## Task Plan

**Story:** [STORY-ID]: [title]
**Detected stack:** [stack]
**Test frameworks:** [unit FW] | [E2E FW]

---

### Story Summary
[2-3 sentences summarizing what the story is about and why it matters]

### Acceptance Criteria
- [ ] [AC 1]
- [ ] [AC 2]
- [ ] [AC 3]

---

### Task List

#### Task 1: [title — noun phrase describing what's being built]
- **Type:** unit | integration | e2e
- **The test will assert:** [one sentence — what the first failing test will assert in behavior terms]
- **Implementation scope:** [what production code will be written to make it pass]
- **Acceptance criteria link:** [which AC item(s) this covers]
- **Dependencies:** none

#### Task 2: [title]
- **Type:** unit | integration | e2e
- **The test will assert:** [one sentence]
- **Implementation scope:** [what code will be written]
- **Acceptance criteria link:** [AC reference]
- **Dependencies:** Task 1

#### Task 3: [title — often a controller/API layer]
- **Type:** integration
- **The test will assert:** [HTTP response behavior, status codes, response body]
- **Implementation scope:** [endpoint handler, routing, serialization]
- **Acceptance criteria link:** [AC reference]
- **Dependencies:** Task 1, Task 2

#### Task [N] (E2E): [title — user-facing flow]
- **Type:** e2e
- **The test will assert:** [full user journey from UI to confirmation, in user-perspective language]
- **Implementation scope:** E2E test only — feature already implemented by prior tasks
- **Acceptance criteria link:** Full AC coverage check
- **Dependencies:** Task [N-1]

---

### Questions for Developer
1. [Ambiguity or scope question]
2. [Edge case clarification]

---

Please review the plan.
- You can add, remove, reorder, or adjust the scope of any task
- When ready, type **"ready"**, **"go"**, or **"approved"**
```

---

## 템플릿 작성 가이드라인

### 태스크 제목
- 명사구 사용: "UserService.updateProfile", "PATCH /api/users/:id endpoint", "Profile edit E2E flow"
- 완료 여부를 알 수 있을 만큼 구체적으로
- "Backend work"나 "Tests" 같은 모호한 제목 금지

### 태스크 유형 선택
- `unit` — 모킹을 통해 단일 클래스/함수를 독립적으로 테스트
- `integration` — 실제 의존성(DB, HTTP 레이어, 프레임워크)과 함께 컴포넌트를 테스트
- `e2e` — UI 또는 API 경계를 통한 전체 사용자 플로우를 테스트

### 태스크 순서 결정 기준
1. 도메인/서비스 레이어 먼저 (순수 비즈니스 로직, 가장 테스트하기 쉬움)
2. 레포지토리/데이터 레이어 두 번째 (영속성)
3. API/컨트롤러 레이어 세 번째 (HTTP 인터페이스)
4. E2E 마지막 (전체 조립된 시스템 검증)

### 태스크 수
- 단순한 스토리 (AC 1-2개): 2-3 태스크 + E2E 1개
- 중간 스토리 (AC 3-4개): 3-5 태스크 + E2E 1개
- 복잡한 스토리: 태스크 계획 전에 스토리 분할 고려

### E2E 태스크 범위
- 스토리당 E2E 태스크 하나면 보통 충분
- E2E 테스트는 스토리의 주요 해피 패스를 커버해야 함
- 엣지 케이스는 단위/통합 테스트가 커버
