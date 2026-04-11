# `.agents/tech-stack.md` 파일 형식

`/sync-tech-stack`가 생성/갱신하는 공유 기술 스택 파일의 형식을 정의한다.

---

## 파일 위치

```text
.agents/tech-stack.md
```

프로젝트 루트 기준이며, 다른 스킬이 직접 읽는 파일이다.

---

## 템플릿

```markdown
# 프로젝트 기술 스택

> **관리 스킬:** /sync-tech-stack
> **생성:** YYYY-MM-DD
> **마지막 업데이트:** YYYY-MM-DD

---

## 스택 요약

| 영역 | 경로 | 스택 | 언어 | 빌드 도구 | Unit Test | E2E |
|------|------|------|------|----------|-----------|-----|
| Root | `.` | TypeScript + React | TypeScript | pnpm | Vitest + React Testing Library | Playwright |
| Backend | `backend/` | Kotlin + Spring | Kotlin | Gradle | JUnit5 + MockK | RestAssured |

---

## [영역명]

- **Path:** `[경로]`
- **Stack:** [스택]
- **Language:** [언어]
- **Build tool:** [빌드/패키지 도구]
- **Unit test framework:** [프레임워크 또는 `—`]
- **E2E framework:** [프레임워크 또는 `—`]
- **Source roots:** `[경로1]`, `[경로2]`
- **Test roots:** `[경로1]`, `[경로2]`
- **Detection signals:** [핵심 신호 나열]
- **Status:** detected | inferred | confirmed manually

---

## Manual Notes

- [개발자가 남기는 메모]
```

---

## 작성 규칙

1. `## 스택 요약`은 항상 유지한다
2. 영역별 상세 섹션은 요약 표 순서와 동일하게 쓴다
3. 설명은 짧게 유지하고, 다른 스킬이 바로 사용할 수 있는 정보만 남긴다
4. 스캔 근거는 `Detection signals`에 압축해서 적는다
5. 루트 경로와 테스트 프레임워크는 비워 두지 않는다. 없으면 `—`를 쓴다

---

## 업데이트 규칙

1. 감지 결과가 달라지면 요약 표와 해당 영역 섹션을 갱신한다
2. 사라진 스택은 파일에서도 제거한다
3. 새로 생긴 스택은 새 영역 섹션으로 추가한다
4. 기존 `## Manual Notes` 섹션이 있으면 유지한다
5. `마지막 업데이트` 날짜를 갱신한다
