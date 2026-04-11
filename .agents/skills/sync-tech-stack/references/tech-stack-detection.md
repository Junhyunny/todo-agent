# 기술 스택 재탐지 규칙

`.agents/tech-stack.md`를 만들거나 갱신할 때 사용하는 감지 규칙이다.

---

## 감지 원칙

1. **빌드/패키지 파일을 우선한다**
2. 스택 하나당 **루트 경로를 함께 기록한다**
3. 모노레포는 **영역별로 분리**한다
4. 테스트 프레임워크와 E2E 프레임워크는 스택과 함께 감지한다
5. 확신이 낮은 경우 사용자에게 확인받고 기록한다

---

## 우선 감지 대상 파일

| 파일 | 기본 의미 |
|------|----------|
| `package.json` | TypeScript/JavaScript 계열 |
| `build.gradle.kts` | Kotlin/Gradle 계열 |
| `build.gradle` | Java/Gradle 계열 |
| `pom.xml` | Java/Maven 계열 |
| `pyproject.toml` | Python 계열 |
| `requirements.txt`, `requirements-dev.txt` | Python 계열 |

---

## 스택별 규칙

### TypeScript + React

**주요 신호**
- `package.json` 존재
- `dependencies` 또는 `devDependencies`에 `react`
- `typescript` 또는 `.ts`/`.tsx` 파일 존재

**테스트 프레임워크 신호**
- `vitest` → Unit test framework: Vitest
- `jest` → Unit test framework: Jest
- `@testing-library/react` → React component testing
- `@playwright/test` 또는 `playwright.config.*` → E2E: Playwright
- `cypress` 또는 `cypress.config.*` → E2E: Cypress

**기록 예시**
- Stack: `TypeScript + React`
- Language: `TypeScript`
- Build tool: `npm` / `pnpm` / `yarn`

### Kotlin + Spring

**주요 신호**
- `build.gradle.kts` 존재
- `kotlin("jvm")` 또는 `id("org.jetbrains.kotlin.jvm")`
- `org.springframework.boot`

**테스트 프레임워크 신호**
- `io.mockk:mockk` → MockK
- `org.testcontainers` → Testcontainers
- `io.rest-assured` / `io.restassured` → RestAssured

**기록 예시**
- Stack: `Kotlin + Spring`
- Language: `Kotlin`
- Build tool: `Gradle`

### Java + Spring

**주요 신호**
- `build.gradle` + `src/main/java/`
- 또는 `pom.xml` + `src/main/java/`
- Spring Boot 관련 plugin/dependency 존재

**테스트 프레임워크 신호**
- `org.mockito` / `mockito-core` → Mockito
- `org.testcontainers` / `testcontainers` → Testcontainers
- `io.rest-assured` / `rest-assured` → RestAssured

**기록 예시**
- Stack: `Java + Spring`
- Language: `Java`
- Build tool: `Gradle` 또는 `Maven`

### Python + FastAPI

**주요 신호**
- `pyproject.toml` 또는 `requirements*.txt`
- `fastapi` dependency

**테스트 프레임워크 신호**
- `pytest` → pytest
- `httpx` → API/client testing
- `pytest-asyncio` → async pytest
- `playwright` → E2E: Playwright

**기록 예시**
- Stack: `Python + FastAPI`
- Language: `Python`
- Build tool: `uv` / `poetry` / `pip`

---

## 모노레포 처리

다음처럼 서로 다른 빌드 파일이 여러 경로에 흩어져 있으면 각 경로를 별도 영역으로 기록한다.

예시:
- `frontend/package.json`
- `backend/build.gradle.kts`
- `admin/package.json`

이 경우 요약 표에 각각 한 줄씩 기록한다.

영역 이름은 다음 우선순위로 정한다:
1. 디렉토리명 (`frontend`, `backend`, `admin`)
2. 루트면 `Root`
3. 더 적절한 서비스명이 명확하면 그 이름

---

## 모호성 처리

### 여러 후보가 충돌하는 경우

- 동일 경로에 상충하는 빌드 도구가 함께 있으면 사용자에게 확인받는다
- 예: `build.gradle`과 `pom.xml`이 함께 있으면 `Gradle`/`Maven` 중 실제 사용 도구를 묻는다

### 아무 신호가 없는 경우

사용자에게 스택을 직접 지정받고, 감지 근거에 `manual confirmation`을 남긴다.

---

## 프레임워크 기록 규칙

없는 항목은 `—`로 기록한다.

프레임워크는 가능한 한 구체적으로 적는다.

예시:
- `Vitest + React Testing Library`
- `JUnit5 + MockK`
- `pytest + httpx + pytest-asyncio`
- `Playwright`
