# 커밋 메시지 템플릿

Phase 4에서 커밋 메시지를 생성할 때 이 템플릿을 사용하세요.

---

## 표준 세션 커밋

```
feat(<scope>): <short description under 72 chars>

Implements <STORY-ID>: <story title>

Tasks completed:
- <task 1 title>: <one-line description of what was implemented>
- <task 2 title>: <one-line description>
- <task 3 title>: <one-line description>

TDD: ping-pong pair programming session
```

---

## 예시

### TypeScript + React 기능

```
feat(user-profile): add profile name and email update

Implements PROJ-123: User Profile Update

Tasks completed:
- UserService.updateProfile: validates and persists name/email changes
- UserController PATCH /api/users/:id: request parsing and response formatting
- ProfileForm component: edit form with inline validation messages
- E2E: edit profile flow from form submission to success confirmation

TDD: ping-pong pair programming session
```

### Kotlin + Spring 기능

```
feat(payment): add payment intent creation endpoint

Implements PROJ-456: Payment Intent Creation API

Tasks completed:
- PaymentService.createIntent: creates Stripe payment intent with amount validation
- PaymentRepository.save: persists intent with idempotency key
- POST /api/payments/intent: 201 response with client secret
- E2E: payment intent creation with valid card details returns client secret

TDD: ping-pong pair programming session
```

### Python + FastAPI 버그 수정

```
fix(orders): correct rounding error in order total calculation

Fixes PROJ-789: Payment amount decimal rounding error

Root cause: float arithmetic used for monetary values; replaced with
integer cents throughout the calculation pipeline.

Tasks completed:
- OrderCalculator.calculate_total: all values in integer cents
- OrderCalculator tests: added rounding edge cases

TDD: ping-pong pair programming session
```

---

## 스코프 선택 가이드

| 스택 | 좋은 스코프 예시 |
|------|----------------|
| TypeScript + React | `user-profile`, `cart`, `checkout`, `auth`, `dashboard` |
| Kotlin + Spring | `user-service`, `payment`, `order`, `notification`, `auth` |
| Java + Spring | Kotlin과 동일 |
| Python + FastAPI | `users`, `products`, `orders`, `auth`, `analytics` |

변경된 내용을 가장 잘 설명하는 기능/모듈명을 사용하고, 기술 레이어명은 사용하지 마세요.
