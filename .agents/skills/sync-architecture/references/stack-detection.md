# 스택 감지 규칙

`/sync-architecture`가 프로젝트 스택을 감지할 때 사용하는 규칙이다.

---

## 감지 원칙

1. **빌드/패키지 파일을 우선한다**
2. 스택 하나당 **루트 경로를 함께 기록한다**
3. 모노레포는 **영역별로 분리**한다
4. 테스트 프레임워크는 스택과 함께 감지한다
5. 확신이 낮은 경우 사용자에게 확인받는다

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
- `package.json` + `react` dependency + `.ts`/`.tsx` 파일

**테스트 프레임워크 신호**
- `vitest` → Vitest
- `jest` → Jest
- `@testing-library/react` → React Testing Library
- `@playwright/test` 또는 `playwright.config.*` → Playwright
- `cypress` → Cypress

**추가 감지 항목**
- `electron` → Electron 데스크톱 앱 (IPC 패턴 확인 필요)
- `orval` 또는 `openapi-generator` → API 클라이언트 자동생성 파이프라인 존재
- `shadcn`, `@base-ui/react`, `tailwindcss` → UI 컴포넌트 라이브러리

### Kotlin + Spring

**주요 신호**
- `build.gradle.kts` + `kotlin("jvm")` + `org.springframework.boot`

**테스트 프레임워크 신호**
- `io.mockk:mockk` → MockK
- `org.testcontainers` → Testcontainers
- `io.rest-assured` → RestAssured

### Java + Spring

**주요 신호**
- `build.gradle` 또는 `pom.xml` + `src/main/java/` + Spring Boot dependency

**테스트 프레임워크 신호**
- `org.mockito` → Mockito
- `org.testcontainers` → Testcontainers
- `io.rest-assured` → RestAssured

### Python + FastAPI

**주요 신호**
- `pyproject.toml` 또는 `requirements*.txt` + `fastapi` dependency

**테스트 프레임워크 신호**
- `pytest` → pytest
- `httpx` → API 테스트
- `pytest-asyncio` → async pytest

---

## 모노레포 처리

서로 다른 빌드 파일이 여러 경로에 흩어져 있으면 각 경로를 별도 영역으로 기록한다.

영역 이름 우선순위:
1. 디렉토리명 (`frontend`, `backend`, `admin`)
2. 루트면 `Root`
3. 더 적절한 서비스명이 명확하면 그 이름

---

## 모호성 처리

- 동일 경로에 빌드 도구가 충돌하면 사용자에게 확인받는다
- 아무 신호도 없으면 사용자에게 스택을 직접 지정받는다

