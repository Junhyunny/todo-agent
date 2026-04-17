# 커밋 컨벤션

`/review-and-commit` 스킬은 Conventional Commits 형식을 사용합니다.

---

## 형식

```
<type>(<scope>): <short description>

<body>

Review: <review outcome>
```

### 규칙

- **첫 번째 줄:** 최대 72자, 명령형 어조 ("added" 아닌 "add")
- **빈 줄** subject, body, footer 사이에 추가
- **Body:** 무엇을 했는지와 그 이유 설명 (방법은 제외)
- **Review 줄:** 리뷰 결과 요약 ("passed", "refactored X", "improvements applied" 등)

---

## 타입

| 타입 | 사용 시점 |
|------|----------|
| `feat` | 새로운 기능 구현 |
| `fix` | 버그 수정 |
| `refactor` | 리팩토링 전용 (새로운 동작 없음) |
| `test` | 테스트만 변경 |
| `chore` | 설정, 빌드, 도구 변경 |
| `docs` | 문서만 변경 |

---

## 스코프

기능/도메인 이름을 스코프로 사용합니다 (기술 레이어명 사용 금지):

| 컨텍스트 | 스코프 예시 |
|---------|-------------|
| TypeScript React | `user-profile`, `cart`, `checkout`, `auth` |
| Kotlin/Java Spring | `payment`, `order`, `user-service`, `notification` |
| Python FastAPI | `users`, `products`, `orders`, `auth` |
| 횡단 관심사 | `api`, `domain`, `core` |

---

## 예시

### 리뷰 통과 후 커밋

```
feat(user-profile): add profile update functionality

Implements user profile name and email update via PATCH endpoint.
Validates input before persistence and returns updated resource.

Review: passed — no issues found
```

### 리팩토링 적용 후 커밋

```
refactor(payment): extract validation logic to PaymentValidator

Extracted duplicated validation from PaymentService and OrderService
into a shared PaymentValidator to eliminate code duplication.

Review: improvements applied — duplication resolved
```

### 버그 수정 후 커밋

```
fix(orders): correct rounding error in order total calculation

Root cause: float arithmetic used for monetary values; replaced with
integer cents throughout the calculation pipeline.

Review: passed — security and duplication checks clean
```

---

## 스테이징할 파일과 스테이징하지 않을 파일

### 항상 스테이징

- 수정하거나 생성한 소스 파일
- 수정하거나 생성한 테스트 파일
- 새 코드에 직접 필요한 설정 파일

### 절대 스테이징하지 않음

- `.env`, `.env.local`, `.env.production`
- `.gitignore`에 해당하는 파일
- 빌드 결과물: `target/`, `build/`, `dist/`, `__pycache__/`, `.gradle/`
- IDE 파일: `.idea/`, `.vscode/` (프로젝트에서 이미 추적하는 경우 제외)

### 스테이징 전 확인

- 데이터베이스 마이그레이션 파일 (커밋 전 검토 필요)
- `package-lock.json` / `yarn.lock` / `Pipfile.lock` — 의존성이 변경된 경우만 스테이징
