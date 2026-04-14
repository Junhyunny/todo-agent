# 프로젝트 코딩 컨벤션

> **출처:** 코드 분석 (기존 프로젝트)
> **생성:** 2026-04-11 | **마지막 업데이트:** 2026-04-11

---

## 기술 스택 현황

| 영역 | 스택 | 주요 디렉토리 |
|------|------|-------------|
| Frontend | TypeScript + React + Electron | `frontend/` |
| Agent | Python | `agent/` |

---

## [TypeScript + React + Electron] 컨벤션

> 출처: `frontend/package.json`, `frontend/biome.json`, `frontend/src/App.tsx`, `frontend/src/App.test.tsx`, `frontend/src/components/ui/button.tsx`

### 테스트 컨벤션

**파일 위치**
- co-located — 컴포넌트/모듈 옆에 `*.test.tsx` 파일을 둔다

**테스트 구조**
- 컴포넌트 테스트는 `describe(ComponentName, ...)` 블록으로 감싼다
- 블록 안에서 top-level `test(...)`를 사용한다
- React Testing Library로 렌더링 후 role 기반 쿼리를 사용한다

**Mock 패턴**
- 아직 프로젝트 고유 mock 패턴은 충분히 관찰되지 않았다
- [기본값] Vitest의 `vi.fn()`, `vi.stubGlobal()` 같은 기본 mock 도구를 우선 사용한다

**Assertion 패턴**
- `expect(element).toBeInTheDocument()`
- `within(element).getByRole(...)`

**테스트 명명 규칙**
- 한국어 문장형 테스트명을 사용한다

### 소스 코드 컨벤션

**디렉토리 구조**
- `frontend/src/` 아래에 앱 엔트리(`main.ts`, `renderer.ts`, `main.tsx`)와 컴포넌트를 함께 둔다
- UI 컴포넌트는 `components/ui/`에 둔다

**클래스/함수 패턴**
- 함수형 React 컴포넌트를 선호한다
- named export를 사용한다

**의존성 주입**
- React props와 Electron preload 전역 API를 통해 의존성을 연결한다
- main/renderer 경계는 preload 브리지로 노출한다

**에러 처리**
- 아직 고유 패턴은 관찰되지 않았다
- [기본값] renderer에서 필요한 API가 없으면 테스트에서 명시적으로 stub하고, 구현에서는 broad catch 없이 호출 경계를 유지한다

### 리팩토링 기준
- Biome 포맷을 따른다: double quotes, 2-space indent
- UI 테스트는 구현 세부사항보다 사용자 상호작용과 접근 가능한 role/name을 우선 검증한다
- Electron main/renderer/preload 경계는 역할을 분리한다

### 안티패턴

| 안티패턴 | 이유 | 대안 |
|----------|------|------|
| 구현 세부사항 DOM 구조 직접 검사 | 리팩토링에 취약함 | role/name 기반 질의 |
| GREEN 단계에서 불필요한 IPC/창 옵션까지 한 번에 구현 | TDD 사이클이 흐려짐 | 현재 테스트가 요구하는 최소 연결만 구현 |
| renderer에서 Electron 모듈 직접 접근 | 보안/구조 경계가 흐려짐 | preload API로 노출 |

---

## [Python] 컨벤션

> 출처: `agent/requirements.txt`, `agent/ruff.toml`, `agent/src/main.py`

### 테스트 컨벤션

**파일 위치**
- [기본값] `agent/tests/` 또는 소스 옆 `test_*.py` 패턴을 사용한다

**테스트 구조**
- [기본값] pytest 함수 기반 테스트를 우선 사용한다

**Mock 패턴**
- [기본값] `unittest.mock` 또는 pytest fixture 기반 mock을 사용한다

**Assertion 패턴**
- [기본값] plain `assert`를 우선 사용한다

**테스트 명명 규칙**
- [기본값] `test_should_x_when_y` 형식의 snake_case 이름을 사용한다

### 소스 코드 컨벤션

**디렉토리 구조**
- 단일 실행 스크립트 중심으로 `agent/src/`에 소스를 둔다

**클래스/함수 패턴**
- top-level 함수와 모듈 상수를 사용한다
- 타입 힌트를 사용한다

**의존성 주입**
- 아직 고유 DI 패턴은 관찰되지 않았다
- [기본값] 함수 인자 또는 팩토리 함수 반환값으로 의존성을 전달한다

**에러 처리**
- broad catch 없이 예외를 그대로 드러내는 편이다

### 리팩토링 기준
- Ruff 포맷을 따른다: 2-space indent, import 정렬
- 긴 프롬프트 문자열과 콘솔 출력 보조 함수는 별도 함수/상수로 유지한다

### 안티패턴

| 안티패턴 | 이유 | 대안 |
|----------|------|------|
| 타입 힌트 없는 공개 함수 | 의도 파악이 어려움 | 함수 시그니처에 타입 명시 |
| 무분별한 전역 상태 추가 | 실행 흐름 추적이 어려움 | 명시적 함수 경계 사용 |
| broad exception swallow | 실패 원인이 숨겨짐 | 예외를 그대로 노출하거나 구체적으로 처리 |

---

## Custom Rules (개발자 정의)

> `add rule [내용]` 명령으로 추가됩니다. 모든 단계에서 최우선으로 적용됩니다.

- 윈도우 컴포넌트는 `frontend/src/windows/` 디렉토리에 둔다
- **persistence layer test**: FastAPI + SQLAlchemy 통합 테스트는 `backend/src/conftest.py`에 `autouse=True` 픽스처를 두고 in-memory SQLite(`sqlite+aiosqlite:///:memory:`)로 모든 테스트 DB를 격리한다. `app.dependency_overrides[get_session]`으로 프로덕션 세션을 테스트 세션으로 교체하고, 각 테스트 후 `app.dependency_overrides.clear()`와 `engine.dispose()`로 정리한다.
- **테스트 셋업/검증 독립성**: 테스트의 셋업(arrange)과 검증(assert)에서 구현 코드(다른 API 엔드포인트, 서비스 메서드 등)를 호출하지 않는다. 셋업은 DB에 직접 데이터를 삽입하고, 검증은 DB를 직접 조회하거나 응답 데이터만으로 확인한다. 이유: 다른 기능의 버그가 테스트 결과에 영향을 주는 것을 방지하고, 테스트 대상을 명확히 격리한다.
- **API 호출은 repository 모듈을 통해 수행한다. 함수를 즉시 노출한다.** `frontend/src/repository/` 디렉토리에 도메인별 파일을 두고, 클래스나 객체 없이 함수를 named export로 노출한다. (예: `export const createAgent = async (...) => { ... }`)

