# 세션 상태 템플릿

이 템플릿은 모든 AI 액션 이전에 대화 내에서 인라인으로 렌더링됩니다.
별도 파일을 생성하지 마세요 — 마크다운 블록으로 렌더링하세요.

---

## 전체 상태 블록 (복사하여 입력)

```markdown
---
## 🏓 Session State
| Field        | Value |
|--------------|-------|
| Story        | [STORY-ID]: [story title] |
| Stack        | [TypeScript+React / Kotlin+Spring / Java+Spring / Python+FastAPI] |
| Test FW      | [Vitest / JUnit5+MockK / JUnit5+Mockito / pytest] |
| E2E FW       | [Playwright / RestAssured / RestAssured / httpx+playwright / none] |
| Conventions  | [new project / existing project — key patterns summary] |
| Phase        | [PLANNING / RED / GREEN / REFACTOR] |
| Current Task | [N] of [total]: [task title] |
| Turn         | [DEV / AI] |
| Next Action  | [one-line description of what happens next] |
---
```

---/

## 태스크 진행 블록 (Phase 3에서 상태와 함께 표시)

```markdown
### Task Progress
| # | Title | Type | Status |
|---|-------|------|--------|
| 1 | [title] | unit | ✅ done / 🔄 active / ⏳ pending |
| 2 | [title] | integration | ⏳ pending |
| 3 | [title] | e2e | ⏳ pending |
```

---

## 상태 값 참조

### Phase 값
- `PLANNING` — Phase 2, 태스크 분류 작업 중
- `RED` — 실패하는 테스트 작성 중
- `GREEN` — 최소 구현 작성 중
- `REFACTOR` — 코드 품질 검토 및 개선 중

### Turn 값
- `DEV` — 개발자의 차례 (AI 대기 중)
- `AI` — AI의 차례 (AI 행동 중)

### Status 값 (태스크 진행)
- `⏳ pending` — 시작 전
- `🔄 active` — 현재 진행 중
- `✅ done` — 모든 테스트 통과, 리팩토링 완료

---

## 예시: 작성된 상태 블록

```markdown
---
## 🏓 Session State
| Field        | Value |
|--------------|-------|
| Story        | PROJ-123: User profile update |
| Stack        | TypeScript + React |
| Test FW      | Vitest + @testing-library/react |
| E2E FW       | Playwright |
| Conventions  | existing project — co-located *.test.ts, describe/it, vi.mock, PascalCase+Service |
| Phase        | RED |
| Current Task | 2 of 4: UserService.updateProfile |
| Turn         | AI |
| Next Action  | AI writes failing unit test for updateProfile method |
---

### Task Progress
| # | Title | Type | Status |
|---|-------|------|--------|
| 1 | UserRepository.save | unit | ✅ done |
| 2 | UserService.updateProfile | unit | 🔄 active |
| 3 | UserController PATCH /users/:id | integration | ⏳ pending |
| 4 | E2E: profile update flow | e2e | ⏳ pending |
```
