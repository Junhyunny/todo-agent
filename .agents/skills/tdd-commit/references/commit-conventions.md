# 커밋 컨벤션

Ping-pong TDD 세션은 구조화되고 읽기 쉬운 히스토리를 위해 Conventional Commits 형식을 사용합니다.

---

## 형식

```
[#<story-id>] <type>(<scope>): <short description>

<body>

<footer>
```

### 규칙

- **첫 번째 줄:** 최대 72자, 명령형 어조 ("added" 아닌 "add")
- **빈 줄** subject, body, footer 사이에 추가
- **Body:** 무엇을 했는지와 그 이유 설명 (방법은 제외)
- **Footer:** 선택적 메타데이터

---

## TDD 세션을 위한 타입

| 타입 | 사용 시점 |
|------|------------|
| `feat` | TDD로 구현한 새로운 기능 (가장 일반적) |
| `fix` | 세션 중 발견하고 수정한 버그 |
| `refactor` | 리팩토링 전용 세션 (새로운 동작 없음) |
| `test` | 테스트만 변경 (ping-pong TDD에서는 드문 경우) |
| `chore` | 세션 중 변경된 설정, 빌드 파일 |

---

## 스코프

기능/모듈 이름을 스코프로 사용합니다:

| 컨텍스트 | 스코프 예시 |
|---------|-------------|
| TypeScript React 컴포넌트 | `user-profile`, `cart`, `auth` |
| Kotlin/Java Spring 서비스 | `user-service`, `payment`, `order` |
| Python FastAPI 엔드포인트 | `users`, `products`, `auth` |
| 횡단 관심사 | `api`, `domain` |

---

## 세션 커밋 템플릿

### 단일 스토리, 복수 태스크

```
feat(user-profile): add profile update functionality

Implements PROJ-123: User Profile Update

Tasks completed:
- UserService.updateProfile: validates and persists name/email changes
- UserController.patchUser: PATCH /api/users/:id endpoint
- ProfileForm component: edit form with validation feedback
- E2E: profile update flow from form to confirmation message

TDD: ping-pong pair programming session
```

### 버그 수정 세션

```
[#PROJ-456] fix(payment): handle currency rounding in order total calculation

Fixes PROJ-456: Payment amount mismatch due to decimal rounding error

Root cause: floating-point arithmetic used instead of integer cents
Solution: convert all monetary values to cents before calculation

Tasks completed:
- OrderCalculator.calculateTotal: use integer arithmetic in cents
- OrderCalculatorTest: added edge cases for rounding scenarios

TDD: ping-pong pair programming session
```

### 리팩토링 세션

```
refactor(user-service): extract validation logic to UserValidator

No behavioral changes — all tests pass before and after refactor.

Motivation: UserService.updateProfile was > 40 lines; validation logic
was duplicated in UserService and OrderService.

TDD: ping-pong pair programming session
```

---

## 스테이징할 파일과 스테이징하지 않을 파일

### 항상 스테이징

- 세션 중 수정하거나 생성한 소스 파일
- 세션 중 생성한 테스트 파일
- 새 코드에 직접 필요한 설정 파일

### 절대 스테이징하지 않음

- `.env`, `.env.local`, `.env.production`
- `.gitignore`에 해당하는 파일
- 빌드 결과물 (`target/`, `build/`, `dist/`, `__pycache__/`, `.gradle/`)
- IDE 파일 (`.idea/`, `.vscode/` — 프로젝트에서 이미 추적하는 경우 제외)

### 스테이징 전 확인

- 데이터베이스 마이그레이션 파일 (커밋 전 검토가 필요할 수 있음)
- `package-lock.json` / `yarn.lock` / `Pipfile.lock` — 의존성이 변경된 경우 스테이징, 변경되지 않은 경우 건너뜀

---

## 멀티 세션 전략

여러 ping-pong TDD 세션이 하나의 스토리에 기여하는 경우:

**옵션 A: 세션당 하나의 커밋** (세션 간격이 하루 이상인 경우 선호)
```
feat(user-profile): add profile read endpoint (session 1/3)
feat(user-profile): add profile update endpoint (session 2/3)
feat(user-profile): add profile delete and E2E tests (session 3/3)
```

**옵션 B: 모든 세션 스쿼시** (PR 전 깔끔한 히스토리를 원하는 경우 선호)
- 전체 스토리가 완료되면, PR 리뷰 전에 스쿼시합니다
- 위의 전체 스토리 커밋 템플릿을 사용합니다

---

## 커밋 전 확인

커밋을 실행하기 전에 항상 제안된 커밋 메시지와 스테이징할 파일 목록을 표시합니다:

```markdown
## Commit Preview

**Commit message:**
```
[#PROJ-123] feat(user-profile): add profile update functionality

Implements PROJ-123: User Profile Update

Tasks completed:
- ...

TDD: ping-pong pair programming session
```

**Files to stage:**
- src/services/UserService.ts
- src/services/UserService.test.ts
- src/components/ProfileForm.tsx
- src/components/ProfileForm.test.tsx
- e2e/user-profile.spec.ts

Ready to commit?
→ **"commit"** or **"ship it"** — execute the commit
→ To edit the message, type the revised message directly
```
