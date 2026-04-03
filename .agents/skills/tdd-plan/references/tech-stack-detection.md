# 기술 스택 감지 가이드

Phase 2는 프로젝트를 두 단계로 식별합니다.

**Step 1 — 스택 감지 (이 파일):** 빌드 파일과 의존성으로부터 기술 스택과 프레임워크를 결정합니다.
**Step 2 — 컨벤션 감지 (`convention-detection.md`):** 기존 소스/테스트 파일을 읽어 코딩 스타일을 파악합니다.

스택 감지는 항상 실행됩니다. 컨벤션 감지는 기존 코드 파일이 있을 때만 실행됩니다.

---

Phase 2 시작 시 프로젝트 루트 파일을 읽어 기술 스택을 감지합니다. 아래 순서대로 규칙을 적용하며, 위에 있을수록 신뢰도가 높습니다.

---

## 감지 순서

### 1. TypeScript + React

**주요 신호:** `package.json`이 존재합니다.

`package.json`을 읽고 `dependencies`와 `devDependencies`를 확인합니다:

| 필드 존재 여부 | 의미 |
|----------------|---------|
| `"react"` in deps | React 프로젝트 |
| `"typescript"` or `.ts`/`.tsx` files exist | TypeScript 확인됨 |
| `"vitest"` in devDeps | 단위 테스트 FW: Vitest |
| `"jest"` in devDeps | 단위 테스트 FW: Jest |
| `"@testing-library/react"` | 컴포넌트 테스트: RTL |
| `"@playwright/test"` or `playwright.config.*` | E2E: Playwright |
| `"cypress"` or `cypress.config.*` | E2E: Cypress |
| `"next"` in deps | Next.js (React) |
| `"vite"` in devDeps | Vite 툴체인 |

**확인된 스택:** TypeScript + React
**단위 테스트 FW:** Vitest (존재하는 경우) 또는 Jest
**E2E FW:** Playwright (존재하는 경우) 또는 Cypress (존재하는 경우) 또는 미감지

---

### 2. Kotlin + Spring

**주요 신호:** 프로젝트 루트에 `build.gradle.kts`가 존재합니다.

파일을 읽고 확인합니다:

| 신호 | 의미 |
|--------|---------|
| `kotlin("jvm")` or `id("org.jetbrains.kotlin.jvm")` | Kotlin 확인됨 |
| `org.springframework.boot` plugin | Spring Boot |
| `io.mockk:mockk` in test deps | MockK |
| `org.testcontainers` in deps | Testcontainers 사용 가능 |
| `io.rest-assured` or `io.restassured` | RestAssured |
| `src/main/kotlin/` directory exists | Kotlin 소스 루트 |
| `src/test/kotlin/` directory exists | Kotlin 테스트 루트 |

**확인된 스택:** Kotlin + Spring
**단위 테스트 FW:** JUnit5 + MockK
**E2E FW:** RestAssured (또는 컨트롤러 테스트에는 Spring MockMvc)

---

### 3. Java + Spring

**주요 신호:** `build.gradle` (`.kts` 아님) + `src/main/java/` 디렉토리, 또는 `pom.xml` + Java 소스.

**Gradle 신호 (`build.gradle`):**

| 신호 | 의미 |
|--------|---------|
| `org.springframework.boot` plugin | Spring Boot |
| `org.mockito` in test deps | Mockito |
| `org.testcontainers` in deps | Testcontainers |
| `io.rest-assured` or `io.restassured` | RestAssured |
| `src/main/java/` exists | Java 확인됨 |

**Maven 신호 (`pom.xml`):**

| 신호 | 의미 |
|--------|---------|
| `spring-boot-starter-*` dependency | Spring Boot |
| `mockito-core` dependency | Mockito |
| `testcontainers` dependency | Testcontainers |
| `rest-assured` dependency | RestAssured |
| `src/main/java/` exists | Java 확인됨 |

**확인된 스택:** Java + Spring
**단위 테스트 FW:** JUnit5 + Mockito
**E2E FW:** RestAssured

---

### 4. Python + FastAPI

**주요 신호:** `pyproject.toml` 또는 `requirements.txt` 또는 `requirements-dev.txt`.

파일을 읽고 확인합니다:

| 신호 | 의미 |
|--------|---------|
| `fastapi` dependency | FastAPI 확인됨 |
| `pytest` dependency | 테스트 FW: pytest |
| `httpx` dependency | HTTP 테스트 클라이언트 |
| `pytest-asyncio` dependency | 비동기 테스트 지원 |
| `anyio` dependency | 비동기 런타임 |
| `playwright` (Python) | E2E: Playwright |
| `uvicorn` dependency | ASGI 서버 |

**확인된 스택:** Python + FastAPI
**단위 테스트 FW:** pytest + httpx (비동기인 경우 + pytest-asyncio)
**E2E FW:** Playwright (Python) - 존재하는 경우

---

## 모호성 해결

### 여러 프레임워크가 감지된 경우

`build.gradle.kts` (Kotlin)와 `package.json` (React)가 모두 존재하는 경우:
→ 모노레포입니다. 질문합니다: "모노레포로 보입니다. 어떤 서비스로 작업할까요? (frontend / backend)"

`build.gradle`과 `pom.xml`이 모두 존재하는 경우:
→ 비정상적입니다. 질문합니다: "Gradle과 Maven 빌드 파일이 모두 발견되었습니다. 어떤 빌드 도구를 사용 중인가요? (gradle / maven)"

### 신호를 찾을 수 없는 경우

위의 주요 신호가 하나도 감지되지 않는 경우:
→ 질문합니다: "프로젝트 스택을 감지할 수 없었습니다. 다음 중 하나를 지정해 주세요:
   1. TypeScript + React
   2. Kotlin + Spring
   3. Java + Spring
   4. Python + FastAPI
   5. 기타 (설명)"

### 개발자 오버라이드

언제든지 개발자는 `stack: [이름]`을 입력하여 감지 결과를 오버라이드할 수 있습니다:
- `stack: typescript-react` → TypeScript + React
- `stack: kotlin-spring` → Kotlin + Spring
- `stack: java-spring` → Java + Spring
- `stack: python-fastapi` → Python + FastAPI

---

## 표시 형식

감지 후, 계획 제안에 다음과 같이 표시합니다:

```
**Detected stack:** TypeScript + React
**Unit test framework:** Vitest + @testing-library/react
**E2E test framework:** Playwright
```

불확실한 경우:
```
**Detected stack:** TypeScript + React (inferred — found `"vitest"` and `"react"`)
Type `stack: [name]` to override if this is incorrect.
```
