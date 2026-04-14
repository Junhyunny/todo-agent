# `.agents/coding-conventions.md` 파일 형식

`/sync-coding-conventions`가 생성/갱신하는 공유 코딩 컨벤션 파일의 형식을 정의한다.

---

## 파일 위치

```text
.agents/coding-conventions.md
```

프로젝트 루트 기준이며, 프로젝트의 공유 규칙 문서로 유지한다.

---

## 템플릿

```markdown
# 프로젝트 코딩 컨벤션

> **관리 스킬:** /sync-coding-conventions
> **생성:** YYYY-MM-DD
> **마지막 업데이트:** YYYY-MM-DD

---

## [영역명 또는 스택명] 컨벤션

> 출처: 코드 분석 / 사용자 리팩토링 반영 / 기본값

### 테스트 컨벤션

**파일 위치**
- [예: co-located / tests/]

**테스트 구조**
- [예: describe/it / class-based / fixture-based]

**Mock 패턴**
- [예: vi.fn / MagicMock / mock object 주입]

**Assertion 패턴**
- [예: expect(...).toEqual(...) / assert ...]

**테스트 명명 규칙**
- [예: should ... when ...]

### 소스 코드 컨벤션

**디렉토리 구조**
- [예: feature-based / layer-based]

**클래스/함수 패턴**
- [예: function 중심 / class 중심 / hook 분리]

**의존성 연결 방식**
- [예: service 호출 / generated client 사용 / bridge 사용]

**에러 처리**
- [예: 명시적 예외 / 결과 객체 / early return]

### 리팩토링 기준
- [예: helper 추출 기준]
- [예: dead code 제거 기준]

### 안티패턴

| 안티패턴 | 이유 | 대안 |
|----------|------|------|
| [예: 미사용 mock 유지] | 잡음 증가 | 필요한 테스트에서만 선언 |

---

## Custom Rules

- [사용자 또는 팀이 명시적으로 추가한 규칙]
```

---

## 작성 규칙

1. 기존 `## Custom Rules`는 유지한다
2. 전체 재작성보다 섹션 단위 갱신을 우선한다
3. 변경 근거가 명확한 항목만 규칙으로 승격한다
4. 사용자 의도가 의심되는 경우 확인 후 반영한다
5. 변경된 항목에는 `_(업데이트: YYYY-MM-DD)_` 태그를 붙일 수 있다
