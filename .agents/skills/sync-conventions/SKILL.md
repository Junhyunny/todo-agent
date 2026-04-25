---
name: sync-conventions
description: >
   Use this skill when the user says "sync coding conventions", "update conventions",
   "refresh conventions", "컨벤션 동기화", "컨벤션 업데이트", or when you need to
   detect convention drift from AI edits, human edits, and broader project changes.
   Creates or updates CONVENTIONS-{AREA}.md per project area (or CONVENTIONS.md for
   single-area projects), and asks for confirmation when user edits appear to
   intentionally override AI-generated patterns.
---

# Sync Coding Conventions

## Invocation

```text
/sync-conventions
```

인수가 없어도 된다.

이 스킬의 목적은 **프로젝트 전체를 무조건 다시 스캔하는 것**이 아니라, 다음 신호를 바탕으로 컨벤션 파일을 생성 또는 갱신하는 것이다:

- 현재 프로젝트의 실제 코드 상태
- staged / unstaged git diff
- 이번 대화에서 AI가 수정했거나 제안한 패턴
- 사용자가 에디터에서 직접 바꾼 코드

**파일 명명 규칙:**
- 다중 영역: `CONVENTIONS-{AREA}.md` (예: `CONVENTIONS-FRONTEND.md`, `CONVENTIONS-LAMBDA.md`)
- 단일 영역 (루트에 빌드 파일이 바로 있는 경우): `CONVENTIONS.md`

영역(Area) 판단 기준은 `sync-architecture`와 동일하다: 루트 하위 디렉터리에 빌드/패키지 파일이 있거나 명확히 분리된 관심사를 가진 경우.

---

## Step 1: 기존 파일 확인 및 영역 감지

먼저 프로젝트 루트에서 다음을 확인한다:

- `CONVENTIONS-*.md` 패턴의 파일 목록
- 레거시 `CONVENTIONS.md`

**영역 감지:**
루트 디렉터리를 스캔해 독립적인 프로젝트 영역을 식별한다. 영역명은 디렉터리명 대문자 (`frontend/` → `FRONTEND`).

**규칙:**
- 해당 영역의 `CONVENTIONS-{AREA}.md`가 **있으면**, 이 파일을 기준점으로 사용한다
- 해당 영역의 `CONVENTIONS-{AREA}.md`가 **없으면**, 새로 생성하기 위해서만 해당 영역 코드를 직접 읽고 스캔한다
- `ARCHITECTURE-{AREA}.md`가 있으면 참고할 수 있지만, 없어도 계속 진행한다

이 스킬은 **기존 컨벤션 파일이 있을 때 해당 영역을 전체 재스캔하지 않는다.**

---

## Step 2: 변경 신호 수집 및 영역 매핑

컨벤션 파일이 이미 있으면, 전체 프로젝트 스캔 대신 **변경 신호만 우선 수집**한다.

**가장 먼저** 아래 명령을 실행해 실제 변경 상태를 확인한다:

```bash
git diff          # unstaged 변경 확인
git diff --staged # staged 변경 확인
```

수집 대상:

1. `git diff`, `git diff --staged`에 나타나는 변경 파일 **(필수 선행 확인)**
2. 새로 생성되거나 삭제된 파일
3. 최근 변경된 테스트/소스 파일
4. 현재 대화에서 AI가 수정한 파일, AI가 제안한 패턴, AI가 설명한 의도
5. 사용자가 직접 붙여넣거나 에디터에서 수정한 코드 조각

**영역 매핑:** 변경 파일의 최상위 디렉터리를 기준으로 해당 파일이 속한 영역을 결정한다. 변경이 여러 영역에 걸쳐 있으면 각 영역을 독립적으로 처리한다.

**AI 컨텍스트 외 변경 처리:** `git diff`에서 AI가 이번 대화에서 수정하지 않은 파일의 변경이 발견되면, 해당 파일을 직접 읽어 어떤 패턴이 바뀌었는지 분석하고 사용자 의도 후보로 처리한다.

변경 파일이 없는 경우:

- 해당 영역의 `CONVENTIONS-{AREA}.md`가 이미 있으면 **"현재 컨벤션 파일이 최신으로 보입니다."**처럼 짧게 표시하고 종료한다
- 단, 사용자가 특정 파일/패턴을 기준으로 다시 확인해달라고 명시했으면 그 대상만 읽는다

---

## Step 3: 분석 범위 결정

각 영역에 대해 독립적으로 판단한다.

### A. `CONVENTIONS-{AREA}.md`가 이미 있는 경우

이 경우 **해당 영역 전체 재스캔 금지**.

아래 범위만 읽는다:

- 변경된 파일
- 변경된 파일과 직접 연결된 테스트/구현 파일
- `CONVENTIONS-{AREA}.md`

필요한 경우에만 추가로 읽는다:

- import/호출 관계 때문에 패턴 해석이 불가능한 인접 파일 1~2개
- 동일 영역의 대표 파일 1~2개
- `ARCHITECTURE-{AREA}.md`가 있으면 보조 힌트로만 읽을 수 있다

### B. `CONVENTIONS-{AREA}.md`가 없는 경우

이 경우에만 해당 영역 코드를 직접 스캔해 새 파일을 만든다.

- 생성 규칙과 파일 구조는 `references/conventions-template.md`를 따른다
- 스캔 범위는 해당 영역의 변경 파일, 주요 소스/테스트 루트, 디렉토리 구조를 기준으로 제한한다

---

## Step 4: 컨벤션 드리프트 감지

변경된 파일과 기존 `CONVENTIONS-{AREA}.md`를 비교해 다음 유형의 드리프트를 찾는다:

1. **테스트 패턴 변화** — 테스트 위치, 파일 명명, describe/it 구조, mock/assertion 패턴
2. **소스 코드 패턴 변화** — 디렉토리 구조, 함수/클래스 스타일, 의존성 주입, 에러 처리, API client/service/hook 연결 방식
3. **정리/리팩토링 패턴 변화** — 중복 제거, helper 추출 기준, naming 방향, dead code 제거 기준
4. **프로젝트 전반 변화** — 여러 파일에 반복된 새 패턴, 기존 규칙과 다른 새 기본값

---

## Step 5: AI 컨텍스트 vs 사용자 의도 추론

이 스킬은 **AI가 알고 있는 작업 컨텍스트**와 **현재 코드 상태**를 비교한다.

사용자 의도 신호의 예:

- AI가 만든 코드가 사용자의 수동 편집으로 다른 구조가 됨
- AI가 적용한 naming / extraction / dependency pattern이 사람 손으로 다시 정리됨
- 여러 파일에서 같은 방향의 수동 리팩토링이 반복됨

### 의도적 변경으로 간주하는 기준

다음 중 하나 이상이면 사용자 의도 후보로 본다:

- 같은 패턴 변화가 2개 이상 파일에 반복됨
- AI가 최근 만든 코드와 비교해 구조가 더 일관되게 정리됨
- 임시 구현이 제거되고 더 일반화된 패턴으로 바뀜
- 이름, helper, import 구조가 프로젝트 다른 코드와 더 잘 맞아짐

---

## Step 6: 확인이 필요한 경우 질문

AI 컨텍스트와 다른 사용자 리팩토링이 감지되면, 바로 덮어쓰지 말고 질문한다.

```markdown
사용자 의도 후보를 감지했습니다.

- AI가 사용한 패턴: [이전 패턴]
- 현재 코드 패턴: [현재 패턴]
- 근거 파일: [file1], [file2]

이 변경을 CONVENTIONS-{AREA}.md에 반영할까요?
→ "yes" — 현재 패턴을 반영
→ "no" — 이번 변경만 유지, 컨벤션은 그대로 둠
→ "modify [내용]" — 표현을 바꿔 반영
```

질문이 필요한 상황:

- 사용자 리팩토링이 AI 제안과 다르지만 합리적일 때
- 기존 컨벤션과 다른 새 패턴이 보일 때
- 어느 쪽이 팀 표준인지 단정하기 어려울 때

질문이 필요 없는 상황:

- 명백한 포맷 정리만 있는 경우
- 기존 컨벤션에 더 맞추는 방향으로만 수정된 경우
- 기계적인 이름 변경이나 import 정리처럼 규칙 변경으로 보기 어려운 경우

---

## Step 7: `CONVENTIONS-{AREA}.md` 갱신

갱신 규칙:

1. 기존 `## Custom Rules`는 절대 덮어쓰지 않는다
2. 변경이 감지된 항목만 부분 갱신한다
3. 새 파일 생성 시에는 전체 템플릿을 채운다
4. 갱신된 항목에 날짜 태그를 붙이지 않는다
5. 근거가 약한 단일 변경은 확인 없이 팀 규칙으로 승격하지 않는다
6. 영역이 여러 개인 경우, 각 영역의 파일을 독립적으로 갱신한다

---

## Step 8: 파일 압축 검토

갱신 또는 생성된 각 파일을 다음 기준으로 검토하고 압축한다.

1. **이모지·아이콘 제거** — 파일 본문에 포함된 이모지(✅, 💡, ⚠️ 등)는 모두 제거한다
2. **중복 표현 통합** — 동일한 규칙이 여러 섹션에 반복되면 한 곳에만 남기고 나머지는 삭제한다
3. **자명한 규칙 제거** — 프레임워크 기본 동작과 동일한 내용이나 코드를 보면 바로 알 수 있는 내용은 삭제한다
4. **유사 규칙 통합** — 같은 취지의 규칙이 여러 줄에 걸쳐 있으면 하나의 포괄적 규칙으로 합친다
5. **빈 섹션 제거** — 내용이 없는 섹션은 제목까지 삭제한다
6. **과도한 예시 제거** — 코드 예시는 글로 설명하기 어려울 때만 유지하고 나머지는 삭제한다

---

## Step 9: 결과 표시

변경이 있으면:

```markdown
코딩 컨벤션 동기화 완료

생성/갱신된 파일:
- CONVENTIONS-FRONTEND.md — [업데이트된 규칙]
- CONVENTIONS-LAMBDA.md — [업데이트된 규칙]
```

변경이 없으면:

```markdown
컨벤션 파일이 이미 최신입니다.
```

---

## 참조 파일

| 파일 | 사용 시점 |
|------|---------|
| `references/convention-drift-detection.md` | Step 4~6 드리프트 / 의도 추론 시 |
| `references/conventions-template.md` | 새 파일 생성 또는 섹션 구조 확인 시 |
| `CONVENTIONS-{AREA}.md` | 기존 규칙 비교 기준 |
