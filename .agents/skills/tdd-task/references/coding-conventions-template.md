# 코딩 컨벤션 파일 가이드

`.agents/coding-conventions.md`의 구조와 생성/업데이트 규칙을 정의합니다.
이 파일은 팀 전체가 공유할 수 있도록 git에 커밋되며, `/tdd-task` 최초 실행 시 자동 생성됩니다.

---

## 파일 위치

```
.agents/coding-conventions.md   ← 프로젝트 루트 기준, git에 커밋됨
```

`.tdd-sessions/`는 TDD 페어링 컨텍스트 파일(gitignored)이므로 사용하지 않습니다.

---

## 파일 구조 (템플릿)

프로젝트에 감지된 스택 수만큼 스택별 섹션을 만듭니다.

```markdown
# 프로젝트 코딩 컨벤션

> **출처:** 코드 분석 (기존 프로젝트) / 기본값 (새 프로젝트)
> **생성:** [YYYY-MM-DD] | **마지막 업데이트:** [YYYY-MM-DD]

---

## 기술 스택 현황

| 영역 | 스택 | 주요 디렉토리 |
|------|------|-------------|
| [예: Frontend] | TypeScript + React | `frontend/` |
| [예: Backend] | Kotlin + Spring | `backend/` |
| [예: Infrastructure] | Python | `scripts/` |

---

## [TypeScript + React] 컨벤션

> 출처: `frontend/src/` 코드 분석 / 기본값

### 테스트 컨벤션

**파일 위치**
- [예: co-located — `UserService.ts` 옆에 `UserService.test.ts`]

**테스트 구조**
- [예: `describe('ClassName') > describe('methodName') > it('should ...')`]
- beforeEach 위치: [예: describe 블록 내부]

**Mock 패턴**
- [예: `vi.fn()` 직접 주입 — `new Service({ findById: vi.fn() })`]

**Assertion 패턴**
- [예: `expect(result).toEqual(expected)`]

**테스트 명명 규칙**
- [예: `it('should [동작] when [조건]', ...)`]

### 소스 코드 컨벤션

**디렉토리 구조**
- [예: feature-based — `src/user/`, `src/order/`]

**클래스/함수 패턴**
- [예: class 기반 — `class UserService { ... }`]

**의존성 주입**
- [예: 생성자 주입 — `constructor(private readonly repo: UserRepository) {}`]

**에러 처리**
- [예: 커스텀 예외 — `throw new UserNotFoundException(id)`]

### 리팩토링 기준
- 함수 최대 줄 수: [예: 10줄]
- [스택 특화 규칙 — 예: React Hook 의존성 배열 누락 금지]

### 안티패턴

| 안티패턴 | 이유 | 대안 |
|----------|------|------|
| [예: 구현 세부사항 테스트] | 리팩토링 시 깨짐 | 동작(behavior) 기반 테스트 |
| [예: GREEN에서 미리 구현] | TDD 사이클 위반 | 테스트가 요구할 때만 추가 |

---

## [Kotlin + Spring] 컨벤션

> 출처: `backend/src/` 코드 분석 / 기본값

### 테스트 컨벤션

**파일 위치**
- [예: `src/test/kotlin/.../` — Maven/Gradle 표준 구조]

**테스트 구조**
- [예: `@DisplayName` + `@Nested` 계층 구조 — JUnit5]

**Mock 패턴**
- [예: `mockk<Repository>()` + `every { ... } returns ...`]

**Assertion 패턴**
- [예: `assertThat(result).isEqualTo(expected)` — AssertJ]

**테스트 명명 규칙**
- [예: `` `should return user when user exists` `` — Kotlin 백틱]

### 소스 코드 컨벤션

**패키지 구조**
- [예: domain-based — `com.example.user`, `com.example.order`]

**클래스 패턴**
- [예: `@Service` + constructor injection — `class UserService(private val repo: UserRepository)`]

**에러 처리**
- [예: ErrorCode enum + 공통 예외 — `throw BusinessException(ErrorCode.USER_NOT_FOUND)`]

### 리팩토링 기준
- [예: Kotlin data class 우선 사용]
- [예: scope function (`let`, `run`, `apply`) 적절히 활용]

### 안티패턴

| 안티패턴 | 이유 | 대안 |
|----------|------|------|
| [예: field injection (`@Autowired`)] | 테스트 어려움 | constructor injection |
| [예: 단위 테스트에서 `@SpringBootTest`] | 느린 테스트 | MockK로 단위 테스트 |

---

## Custom Rules (개발자 정의)

> `add rule [내용]` 명령으로 추가됩니다. 모든 단계에서 최우선으로 적용됩니다.

- [추가된 규칙이 여기에 기록됩니다]
```

---

## 생성 규칙

### Step 1: 프로젝트 전체 스택 감지

프로젝트 루트에서 다음 파일들을 탐색하여 모든 기술 스택을 파악합니다:

| 파일 | 감지되는 스택 |
|------|-------------|
| `package.json` (react 의존성 포함) | TypeScript + React |
| `package.json` (react 없음) | Node.js |
| `build.gradle.kts` (kotlin 플러그인) | Kotlin + Spring |
| `build.gradle` + `src/main/java/` | Java + Spring |
| `pom.xml` + `src/main/java/` | Java + Spring (Maven) |
| `pyproject.toml` / `requirements.txt` (fastapi 포함) | Python + FastAPI |
| `pyproject.toml` / `requirements.txt` (fastapi 없음) | Python |

모노레포 구조(단일 저장소에 복수 서비스)인 경우 각 서브 디렉토리를 별도 스택으로 처리합니다.

### Step 2: 기존 코드 스캔 (기존 프로젝트)

감지된 각 스택 영역에서 독립적으로 스캔합니다.

**스캔 대상 파일 수:**
- 코드가 풍부한 프로젝트 (파일 50개 이상): 스택별로 최근 수정 테스트 파일 5~10개, 소스 파일 3~5개
- 코드가 적은 초기 프로젝트 (파일 10~50개): 스택별로 테스트 파일 3~5개, 소스 파일 1~3개

**스캔 우선순위:**
1. 최근 수정된 테스트 파일 (팀의 현재 관례를 반영)
2. 코드 스타일 설정 파일 (`.eslintrc`, `detekt.yml`, `pyproject.toml [tool.ruff]` 등)
3. 소스 파일 (의존성 주입, 에러 처리 패턴 확인)

**패턴 충돌 처리:**
- 프로젝트 내에 두 가지 패턴이 혼재하는 경우 더 많이 쓰인 패턴을 채택합니다
- 동수인 경우 더 최근에 작성된 파일의 패턴을 따릅니다
- 파일에 `[두 가지 패턴 혼재 — 최신 패턴 적용]` 주석을 남깁니다

### Step 3: 새 프로젝트 기본값 적용

감지된 각 스택에 대해 위 파일 구조 템플릿의 **모든 섹션**을 채웁니다.
각 항목은 해당 스택의 일반적인 베스트 프랙티스를 기반으로 하며, `[기본값]` 태그를 붙여 실제 코드 분석값과 구분합니다.

**채워야 할 섹션 (스택별로 반복):**

| 섹션 | 채울 내용 |
|------|---------|
| 테스트 컨벤션 > 파일 위치 | 스택 표준 위치 (예: co-located vs `src/test/`) |
| 테스트 컨벤션 > 테스트 구조 | describe/it 계층, `@Nested`, class-based 등 |
| 테스트 컨벤션 > Mock 패턴 | vi.fn(), MockK, Mockito, MagicMock 등 |
| 테스트 컨벤션 > Assertion 패턴 | expect().toEqual(), AssertJ, pytest assert 등 |
| 테스트 컨벤션 > 테스트 명명 규칙 | `should ... when ...` 형식 등 |
| 소스 코드 컨벤션 > 디렉토리 구조 | feature-based / layer-based / domain-based |
| 소스 코드 컨벤션 > 클래스/함수 패턴 | class vs function, 주요 어노테이션/데코레이터 |
| 소스 코드 컨벤션 > 의존성 주입 | 생성자 주입, DI 프레임워크 패턴 |
| 소스 코드 컨벤션 > 에러 처리 | 커스텀 예외, ErrorCode enum, HTTP 상태 매핑 |
| 리팩토링 기준 | 함수 최대 줄 수, 스택 특화 규칙 |
| 안티패턴 | 구현 세부사항 테스트, field injection 등 3~5개 |

**스택별 핵심 기본값 요약:**

| 스택 | 기본 테스트 구조 | 기본 Mock | 기본 Assertion |
|------|---------------|-----------|---------------|
| TypeScript + React | Vitest + describe/it | vi.fn() 직접 주입 | expect().toEqual() |
| Kotlin + Spring | JUnit5 + @Nested | MockK | AssertJ |
| Java + Spring | JUnit5 + @Nested | Mockito | AssertJ |
| Python + FastAPI | pytest + class-based | MagicMock | assert |

---

## 업데이트 규칙

### `add rule [내용]` 처리

`## Custom Rules` 섹션에 다음 형식으로 추가합니다:

```markdown
- [내용] _(추가: YYYY-MM-DD)_
```

### `update conventions` 처리

1. 이번 세션에서 작성된 파일을 다시 읽습니다
2. 기존 섹션 값과 다른 패턴이 발견되면 해당 항목만 업데이트합니다
3. Custom Rules는 절대 건드리지 않습니다
4. 변경된 항목 옆에 `_(업데이트: YYYY-MM-DD)_` 태그를 추가합니다

---

## 컨벤션 우선순위

```
1순위: Custom Rules (개발자가 명시적으로 추가한 규칙) — 항상 최우선
2순위: 코드 스캔으로 감지된 실제 프로젝트 패턴
3순위: 스택 일반 베스트 프랙티스 기반 생성값 [기본값] 태그 항목
```
