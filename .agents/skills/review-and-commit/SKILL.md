---
name: review-and-commit
description: >
  Use this skill when the user says "review and commit", "코드 리뷰 후 커밋", "리뷰하고 커밋",
  "변경 사항 리뷰", or wants to review their code changes and then commit them.
  Reviews staged/unstaged changes for security risks, code duplication, module separation,
  and improvement opportunities, then validates with tests/lint/format, and commits using
  Conventional Commits format.
---

# Review and Commit

## 호출 방법

```
/review-and-commit
```

---

## 전체 흐름

```
1단계: 변경 사항 수집
     ↓
2단계: 코드 리뷰
     ↓
3단계: 개선 사항 유무 판단
     ├─ 개선 필요 → 계획 제시 → 사용자 승인?
     │               ├─ Yes → 구현 → 1단계로 돌아감
     │               └─ No  → 4단계로
     └─ 개선 불필요 → 4단계로
          ↓
4단계: 포맷 확인
     ↓
5단계: 린트
     ↓
6단계: 테스트 실행
     ├─ 실패 → 실패 원인 보고 후 중단
     └─ 성공 → 7단계로
          ↓
7단계: 커밋 메시지 제안 및 커밋 실행
```

---

## 1단계: 변경 사항 수집

1. `git diff HEAD` 및 `git status`로 변경된 파일 목록과 내용을 확인
2. **변경 사항이 없는 경우:**
   ```
   No changes detected. Stage or modify files before running /review-and-commit.
   ```
   중단.
3. 변경된 파일 목록을 출력:
   ```markdown
   ## Changed Files
   - Modified: src/services/UserService.ts
   - Added:    src/services/UserService.test.ts
   - Deleted:  src/utils/legacy.ts
   ```

---

## 2단계: 코드 리뷰

변경된 파일의 diff를 분석하여 아래 4가지 관점에서 리뷰합니다.

```markdown
## Code Review

### 🔐 Security
[보안 취약점, 민감 데이터 노출, 인증/인가 누락, SQL Injection, XSS 등]
- **[파일명:라인]** [문제 설명] → [권장 조치]
- 문제 없음: "No security issues found."

### 🔁 Duplication & Refactoring
[중복 로직, 추출 가능한 함수/클래스, 단일 책임 원칙 위반 등]
- **[파일명:라인]** [중복/개선 사항] → [권장 조치]
- 문제 없음: "No duplication issues found."

### 📦 Module Separation
[지나치게 큰 클래스/모듈, 별도 파일로 분리할 로직, 의존성 역전 위반 등]
- **[파일명:라인]** [분리 필요 사항] → [권장 조치]
- 문제 없음: "No module separation issues found."

### 💡 Better Direction
[현재 구현과 테스트를 함께 봤을 때 더 나은 접근 방법, 누락된 엣지 케이스,
 테스트 커버리지 개선, 명명 규칙, 타입 안전성 등]
- **[파일명:라인]** [제안 사항] → [권장 접근 방법]
- 문제 없음: "No further suggestions."
```

### 리뷰 심각도 분류

| 레벨 | 설명 | 처리 방식 |
|------|------|----------|
| 🔴 Critical | 보안 취약점, 데이터 손실 가능성 | 반드시 수정 후 진행 |
| 🟡 Warning  | 중복 코드, 리팩토링 필요 | 사용자에게 수정 여부 확인 |
| 🔵 Suggestion | 개선 방향, 더 나은 패턴 제안 | 사용자에게 수정 여부 확인 |

---

## 3단계: 개선 사항 판단

### 개선 불필요한 경우 (모든 항목이 "문제 없음")

```
✅ Code review passed. No improvements needed.
Proceeding to format check...
```

4단계로 이동.

### 개선 필요한 경우

리뷰 항목 중 하나라도 문제가 있으면 작업 계획을 먼저 제시합니다.

```markdown
## Improvement Plan

Based on the code review, the following improvements are recommended:

### 🔴 Critical (must fix)
1. [파일명] — [문제 요약]
   - Action: [구체적인 수정 방법]

### 🟡 Warning (recommended)
2. [파일명] — [문제 요약]
   - Action: [구체적인 수정 방법]

### 🔵 Suggestion (optional)
3. [파일명] — [문제 요약]
   - Action: [구체적인 수정 방법]

---
Would you like me to apply these improvements?
→ **"yes"** — apply all improvements, then re-run the full review-format-lint-test-commit flow
→ **"no"**  — skip improvements and proceed to format-lint-test-commit
→ **"critical only"** — apply only critical fixes, then proceed
```

일시 중지하고 사용자 응답을 기다립니다.

#### 사용자가 "yes" 또는 "critical only"를 선택한 경우

1. 해당 개선 사항을 구현
2. 구현 완료 후 다음을 출력:
   ```
   ✅ Improvements applied. Re-running full review cycle...
   ```
3. **1단계로 돌아가** 전체 review-format-lint-test-commit 프로세스를 다시 진행

#### 사용자가 "no"를 선택한 경우

```
Skipping improvements. Proceeding to format check...
```

4단계로 이동.

---

## 4단계: 포맷 확인

프로젝트의 포맷터를 자동으로 감지하여 실행합니다.

### 포맷터 감지 우선순위

| 파일/설정 | 명령어 |
|-----------|--------|
| `package.json` (prettier) | `npx prettier --check .` |
| `.prettierrc` | `npx prettier --check .` |
| `pyproject.toml` / `setup.cfg` (black/ruff) | `ruff format --check .` 또는 `black --check .` |
| `build.gradle` / `pom.xml` (spotless/ktlint) | `./gradlew spotlessCheck` 또는 `./mvnw spotless:check` |
| `.editorconfig` only | 감지만 하고 결과 안내 |

포맷 오류가 발생한 경우:
```markdown
### ⚠️ Format Issues Found

The following files have formatting issues:
- src/services/UserService.ts (line 42: trailing space)
- src/utils/helpers.ts (line 10: missing newline)

Run `npx prettier --write .` to fix, then re-run /review-and-commit.
```
중단.

포맷 통과:
```
✅ Format check passed.
```

---

## 5단계: 린트

프로젝트의 린터를 자동으로 감지하여 실행합니다.

### 린터 감지 우선순위

| 파일/설정 | 명령어 |
|-----------|--------|
| `package.json` (eslint) | `npm run lint` 또는 `npx eslint .` |
| `.eslintrc*` | `npx eslint .` |
| `pyproject.toml` (ruff/flake8) | `ruff check .` 또는 `flake8 .` |
| `build.gradle` (ktlint/detekt) | `./gradlew ktlintCheck` 또는 `./gradlew detekt` |
| `pom.xml` (checkstyle) | `./mvnw checkstyle:check` |

린트 오류가 발생한 경우:
```markdown
### ❌ Lint Errors Found

[lint 명령어 출력 전체 표시]

Fix the lint errors above, then re-run /review-and-commit.
```
중단.

린트 통과:
```
✅ Lint check passed.
```

---

## 6단계: 테스트 실행

프로젝트의 테스트 러너를 자동으로 감지하여 전체 테스트를 실행합니다.

### 테스트 러너 감지 우선순위

| 파일/설정 | 명령어 |
|-----------|--------|
| `package.json` (jest/vitest) | `npm test` 또는 `npm run test` |
| `pytest.ini` / `pyproject.toml` | `pytest` |
| `build.gradle` | `./gradlew test` |
| `pom.xml` | `./mvnw test` |
| `Cargo.toml` | `cargo test` |
| `go.mod` | `go test ./...` |

### 테스트 실패 시

```markdown
### ❌ Tests Failed

**Failed Tests:**
- [테스트 파일명] > [테스트명]
  Error: [실패 메시지]
  Expected: [기대값]
  Received: [실제값]
  at [스택 트레이스]

**Root Cause Analysis:**
[실패 원인 분석 — 코드 변경과의 연관성 설명]

Fix the failing tests above, then re-run /review-and-commit.
```

중단. 커밋을 진행하지 않습니다.

### 테스트 통과 시

```
✅ All [N] tests passed.
```

---

## 7단계: 커밋 메시지 제안 및 커밋

### 커밋 메시지 형식

`references/commit-conventions.md`를 참조하여 Conventional Commits 형식으로 커밋 메시지를 생성합니다.

```
<type>(<scope>): <short description under 72 chars>

<body — what changed and why>

Review: <summary of review outcome, e.g. "passed" or "refactored X">
```

### 타입 선택

| 상황 | 타입 |
|------|------|
| 새로운 기능 | `feat` |
| 버그 수정 | `fix` |
| 리팩토링 (동작 변경 없음) | `refactor` |
| 테스트만 변경 | `test` |
| 설정/빌드 변경 | `chore` |
| 개선 사항 적용 후 커밋 | `refactor` 또는 해당 타입 |

### 스코프 선택

기능/도메인 이름 사용 (기술 레이어명 사용 금지):

| 컨텍스트 | 스코프 예시 |
|---------|-------------|
| TypeScript React | `user-profile`, `cart`, `auth` |
| Kotlin/Java Spring | `payment`, `order`, `user-service` |
| Python FastAPI | `users`, `products`, `auth` |

### 커밋 미리보기 출력 후 일시 중지

```markdown
## Commit Preview

**Message:**
```
<type>(<scope>): <short description>

<body>

Review: passed | improvements applied
```

**Files to stage:**
- [변경된 소스 파일 목록]
- [변경된 테스트 파일 목록]
(Build artifacts, .env files, and IDE folders will NOT be staged)

**Review Summary:**
- Security: ✅ No issues | ⚠️ [N] issues found, [resolved/accepted]
- Duplication: ✅ No issues | ⚠️ [N] issues found, [resolved/accepted]
- Module Separation: ✅ No issues | ⚠️ [N] issues found, [resolved/accepted]
- Better Direction: ✅ No issues | 💡 [N] suggestions, [applied/accepted]

Ready to commit?
→ Type **"commit"** or **"ship it"** to execute
→ Type your preferred message to override it
→ Type **"cancel"** to exit without committing
```

일시 중지하고 기다립니다.

### 커밋 실행

개발자가 `commit` 또는 `ship it`을 입력하면:

1. 소스 및 테스트 파일 스테이징 (스테이징 금지: `.env`, `target/`, `build/`, `dist/`, `__pycache__/`, `.gradle/` 등)
2. `git add [files]` 후 `git commit -m "[message]"` 실행
3. 결과 출력:
   ```
   ✅ Committed: abc1234 feat(payment): add payment intent creation endpoint
   ```

---

## 8단계: 완료 안내

```markdown
✅ Review and commit flow complete.

- Code review: passed
- Format: ✅
- Lint: ✅
- Tests: ✅ [N] passed
- Commit: [hash] [message]
```

---

## 레퍼런스 파일

| 파일 | 읽는 시점 |
|------|-----------|
| `references/commit-conventions.md` | 7단계에서 커밋 메시지 생성 시 |
| `references/review-checklist.md` | 2단계에서 코드 리뷰 수행 시 |
