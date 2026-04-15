---
name: sync-coding-conventions
description: >
  Use this skill when the user says "sync coding conventions", "update conventions",
  "refresh conventions", "컨벤션 동기화", "컨벤션 업데이트", or when you need to
  detect convention drift from AI edits, human edits, and broader project changes.
  Creates or updates `.agents/coding-conventions.md`, and asks for confirmation when
  user edits appear to intentionally override AI-generated patterns.
---

# Sync Coding Conventions

## Invocation

```text
/sync-coding-conventions
```

인수가 없어도 된다.

이 스킬의 목적은 **프로젝트 전체를 무조건 다시 스캔하는 것**이 아니라, 다음 신호를 바탕으로 `.agents/coding-conventions.md`를 생성 또는 갱신하는 것이다:

- 현재 프로젝트의 실제 코드 상태
- staged / unstaged git diff
- 이번 대화에서 AI가 수정했거나 제안한 패턴
- 사용자가 에디터에서 직접 바꾼 코드

---

## Step 1: 기존 파일 확인

먼저 다음 파일 존재 여부를 확인한다:

- `.agents/coding-conventions.md`

규칙:

- `.agents/coding-conventions.md`가 **있으면**, 이 파일을 현재 기준점으로 사용한다
- `.agents/coding-conventions.md`가 **없으면**, 새로 생성하기 위해서만 프로젝트 코드를 직접 읽고 스캔한다
- `.agents/tech-stack.md`가 있으면 참고할 수는 있지만, 이 스킬의 실행 조건이 아니며 없어도 계속 진행한다

이 스킬은 **기존 컨벤션 파일이 있을 때 프로젝트 전체를 다시 검색하지 않는다.**

---

## Step 2: 변경 신호 수집

컨벤션 파일이 이미 있으면, 전체 프로젝트 스캔 대신 **변경 신호만 우선 수집**한다.

수집 대상:

1. `git diff --staged`, `git diff`에 나타나는 변경 파일
2. 새로 생성되거나 삭제된 파일
3. 최근 변경된 테스트/소스 파일
4. 현재 대화에서 AI가 수정한 파일, AI가 제안한 패턴, AI가 설명한 의도
5. 사용자가 직접 붙여넣거나 에디터에서 수정한 코드 조각

변경 파일이 없는 경우:

- `.agents/coding-conventions.md`가 이미 있으면 **"현재 컨벤션 파일이 최신으로 보입니다."**처럼 짧게 표시하고 종료한다
- 단, 사용자가 특정 파일/패턴을 기준으로 다시 확인해달라고 명시했으면 그 대상만 읽는다

---

## Step 3: 분석 범위 결정

### A. `.agents/coding-conventions.md`가 이미 있는 경우

이 경우 **프로젝트 전체 재스캔 금지**.

아래 범위만 읽는다:

- 변경된 파일
- 변경된 파일과 직접 연결된 테스트/구현 파일
- `.agents/coding-conventions.md`

필요한 경우에만 추가로 읽는다:

- import/호출 관계 때문에 패턴 해석이 불가능한 인접 파일 1~2개
- 동일 영역의 대표 파일 1~2개
- `.agents/tech-stack.md`가 이미 있으면 보조 힌트로만 읽을 수 있다

### B. `.agents/coding-conventions.md`가 없는 경우

이 경우에만 프로젝트 코드를 직접 스캔해 새 파일을 만든다.

- 생성 규칙과 파일 구조는 `references/coding-conventions-template.md`를 따른다
- 스캔 범위는 변경 파일, 주요 소스/테스트 루트, 디렉토리 구조를 기준으로 제한한다

---

## Step 4: 컨벤션 드리프트 감지

변경된 파일과 기존 `.agents/coding-conventions.md`를 비교해 다음 유형의 드리프트를 찾는다:

1. **테스트 패턴 변화**
   - 테스트 위치
   - 파일 명명
   - describe/it 구조
   - mock/assertion 패턴

2. **소스 코드 패턴 변화**
   - 디렉토리 구조
   - 함수/클래스 스타일
   - 의존성 주입 방식
   - 에러 처리 방식
   - API client / service / hook / bridge 연결 방식

3. **정리/리팩토링 패턴 변화**
   - 중복 제거 방식
   - helper 추출 규칙
   - naming 정리 방향
   - dead code / obsolete test 제거 기준

4. **프로젝트 전반 변화**
   - 여러 파일에 반복된 새 패턴
   - 기존 규칙과 다른 새 기본값
   - 팀이 전환한 것으로 보이는 스타일

---

## Step 5: AI 컨텍스트 vs 사용자 의도 추론

이 스킬은 **AI가 알고 있는 작업 컨텍스트**와 **현재 코드 상태**를 비교한다.

AI 컨텍스트의 예:

- 이번 대화에서 AI가 직접 수정한 파일
- AI가 방금 적용한 리팩토링 방식
- AI가 설명한 구현/테스트 패턴
- 세션 중 `add rule`로 누적된 규칙

사용자 의도 신호의 예:

- AI가 만든 코드가 사용자의 수동 편집으로 다른 구조가 됨
- AI가 적용한 naming / extraction / dependency pattern이 사람 손으로 다시 정리됨
- 여러 파일에서 같은 방향의 수동 리팩토링이 반복됨

이 경우, 단순 충돌로 보지 말고 **사용자가 의도적으로 팀 규칙을 선택한 것인지** 추론한다.

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
💡 사용자 의도 후보를 감지했습니다.

- AI가 사용한 패턴: [이전 패턴]
- 현재 코드 패턴: [현재 패턴]
- 근거 파일: [file1], [file2]

이 변경을 프로젝트 코딩 컨벤션에 반영할까요?
→ "yes" — 현재 패턴을 `.agents/coding-conventions.md`에 반영
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

## Step 7: `.agents/coding-conventions.md` 갱신

갱신 규칙:

1. 기존 `## Custom Rules`는 절대 덮어쓰지 않는다
2. 변경이 감지된 항목만 부분 갱신한다
3. 새 파일 생성 시에는 전체 템플릿을 채운다
4. 갱신된 항목에는 `_(업데이트: YYYY-MM-DD)_` 태그를 붙인다
5. 근거가 약한 단일 변경은 확인 없이 팀 규칙으로 승격하지 않는다

기록 대상 예시:

- 테스트 명명 규칙 변경
- helper 추출 기준
- API service / client 호출 방식
- preload / bridge / hook 사용 규칙
- dead code / cleanup 기준

---

## Step 8: 결과 표시

변경이 있으면:

```markdown
✅ 코딩 컨벤션 동기화 완료 → `.agents/coding-conventions.md`

변경 사항:
- [업데이트된 규칙]
- [새로 반영된 사용자 의도]
```

변경이 없으면:

```markdown
✅ `.agents/coding-conventions.md`가 이미 최신입니다.
```

---

## 참조 파일

| 파일 | 사용 시점 |
|------|---------|
| `references/convention-drift-detection.md` | Step 4~6 드리프트 / 의도 추론 시 |
| `references/coding-conventions-template.md` | 새 파일 생성 또는 섹션 구조 확인 시 |
| `.agents/coding-conventions.md` | 기존 규칙 비교 기준 |
