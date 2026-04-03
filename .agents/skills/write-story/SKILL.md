---
name: write-story
description: >
  XP 프랙티스에 맞는 사용자 스토리를 AI와 대화 형식으로 함께 작성하고
  TrackerBoot(MCP)에 자동 등록하는 스킬.
version: 1.0.0
category: engineering
tags: [xp, story, agile, trackerboot, user-story]
triggers:
  - write story
  - create story
  - new story
  - 스토리 작성
---

# Write Story

## Invocation

```
/write-story <project-id> ["간략한 주제 힌트"]
```

- **`project-id`** — TrackerBoot 프로젝트 ID **(필수)**
- **주제 힌트** — 선택 사항. 제공하면 해당 맥락을 기반으로 질문 시작

`project-id` 없이 호출되면 Step 0에서 즉시 중단한다.

---

## Step 0: 사전 조건 확인

스킬 실행 전 반드시 다음을 확인한다.

### 프로젝트 ID 확인 (필수)

호출 시 `project-id`가 제공되었는지 확인한다.

**제공되지 않았으면 즉시 중단:**

```
❌ TrackerBoot 프로젝트 ID가 필요합니다.

프로젝트 ID 없이 실행하면 권한이 있는 임의의 프로젝트에 스토리가 등록될 수 있습니다.

사용법: /write-story <project-id> ["주제 힌트"]
예시:   /write-story 12345678
        /write-story 12345678 "결제 페이지"
```

STOP.

**제공되었으면:** `project-id`를 세션 전체에서 사용할 값으로 저장한다.

### persona.md 확인 (필수)

`.agents/skills/write-story/references/persona.md` 존재 여부를 확인한다.

**파일이 없으면 즉시 중단:**

```
❌ 페르소나 정보가 없습니다.

사용자 스토리는 구체적인 페르소나 없이 작성할 수 없습니다.
먼저 `.agents/skills/write-story/references/persona.md` 파일을 작성해주세요.

템플릿은 동일 경로에 있습니다.
```

STOP.

**파일이 있으면:** 페르소나 목록을 로드한다.

### value-proposition.md 확인 (선택)

`.agents/skills/write-story/references/value-proposition.md` 존재 여부를 확인한다.

- **있으면:** 검증할 가정(assumptions)과 사용자 가치(value) 목록을 로드한다.
- **없으면:** Step 1에서 질문으로 수집한다. (중단하지 않음)

---

## Step 1: 컨텍스트 수집

아래 항목을 **한 번에 하나씩** 질문한다. 이전 답변을 바탕으로 다음 질문을 구체화한다.

### 1-1. 페르소나 선택

`persona.md`에서 로드한 페르소나 목록을 보여주고 선택을 요청한다.

```
이 스토리의 주인공은 누구인가요?

[1] [페르소나 이름] — [역할 한 줄 설명]
[2] [페르소나 이름] — [역할 한 줄 설명]
...

번호를 입력하거나, 목록에 없으면 직접 설명해주세요.
```

PAUSE.

### 1-2. 원하는 것

```
[페르소나 이름]이(가) 무엇을 할 수 있기를 원하나요?
(기능이나 행동을 간단히 설명해주세요)
```

PAUSE.

### 1-3. 사용자 가치 (so that)

`value-proposition.md`가 **있으면:** 관련 가치 항목을 참조하여 후보를 제안한다.

`value-proposition.md`가 **없으면:**

```
이 기능을 통해 [페르소나 이름]이(가) 얻는 가치는 무엇인가요?
(앱 바깥에서 일어나는 일 — 예: "고객에게 제안서를 이메일로 보낼 수 있다")
```

PAUSE.

### 1-4. 검증할 가정 (선택)

`value-proposition.md`의 가정 목록을 참조하여 관련 항목을 제안한다.

```
이 스토리를 통해 검증하고 싶은 가정이 있나요?

관련 가정 후보:
- [가정 1]
- [가정 2]

해당하는 것을 선택하거나, "없음"을 입력하세요.
```

PAUSE. (선택 사항 — "없음" / "skip" 가능)

---

## Step 2: 스토리 초안 작성

수집한 정보를 바탕으로 "As a / I want / so that" 형식의 초안을 제안한다.

```markdown
## 스토리 초안

**As a** [구체적인 페르소나],
**I want to** [기능/행동],
**so that** [앱 외부에서 일어나는 사용자 가치].
```

검증할 가정이 있으면 함께 표시:

```markdown
**검증할 가정:** [가정 내용]
```

표시 후:

```
이 스토리 초안이 맞나요?
→ "ok" / "yes" — 다음 단계로
→ 수정하고 싶은 부분을 알려주세요
```

PAUSE. 수정 사항이 있으면 반영 후 재표시. "ok" / "yes" / "좋아" 를 받으면 진행.

형식 상세 규칙은 `.agents/skills/write-story/references/story-format-guide.md` 참조.

---

## Step 3: 인수 기준 작성

GIVEN/WHEN/THEN 형식으로 인수 기준(AC)을 제안한다.

### 제안 순서

1. **해피 패스** — 정상적인 주요 흐름 먼저
2. **엣지 케이스** — 경계값, 예외 흐름
3. **오류 케이스** — 잘못된 입력, 시스템 오류

### 제안 형식

```markdown
## 인수 기준 (초안)

**AC 1 (해피 패스)**
- **GIVEN** [사전 조건]
- **WHEN** [사용자 행동]
- **THEN** [기대되는 결과]

**AC 2**
- **GIVEN** [사전 조건]
- **WHEN** [사용자 행동]
- **THEN** [기대되는 결과]
```

표시 후:

```
인수 기준을 검토해주세요.
→ "add [내용]" — AC 추가
→ "remove [번호]" — AC 제거
→ "edit [번호]" — AC 수정
→ "done" / "ok" — 완료
```

PAUSE. 변경 사항 반영 후 재표시. "done" / "ok" / "완료" 를 받으면 진행.

AC 작성 상세 규칙은 `.agents/skills/write-story/references/ac-writing-guide.md` 참조.

---

## Step 4: 레이블/태그 선택 및 관련 스토리 조회

### 4-1. 레이블 후보 제안

스토리 내용을 분석하여 레이블 후보를 제안한다.

```
이 스토리에 적용할 레이블을 선택해주세요.

추천 레이블:
- [레이블 1]
- [레이블 2]
- [레이블 3]

번호로 선택하거나, 추가/제거를 알려주세요.
"ok" / "done"을 입력하면 확정됩니다.
```

PAUSE.

### 4-2. 관련 스토리 조회

레이블이 확정되면, TrackerBoot MCP로 동일 프로젝트 내 동일 레이블의 기존 스토리를 조회한다.

```
mcp__trackerboot__list_stories (project_id + label filter)
mcp__trackerboot__get_stories
mcp__pivotal__list_stories
```

조회 시 반드시 Step 0에서 저장한 `project-id`를 함께 전달한다.

**관련 스토리가 있으면:**

```
📋 관련 스토리 (레이블: "[레이블]")
- [[스토리 ID]] [스토리 제목]
- [[스토리 ID]] [스토리 제목]

이 스토리들과 일관성을 유지하며 작성합니다.
중복되는 내용이 있다면 알려주세요.
```

AI는 조회된 스토리 내용을 컨텍스트로 활용하여 Step 2, 3의 내용이 중복되지 않는지 검토한다.
중복이 발견되면 개발자에게 알리고 스코프를 조정한다.

**관련 스토리가 없으면:** 조용히 진행한다.

---

## Step 5: 최종 확인

완성된 스토리 전체를 표시하고 최종 승인을 받는다.

```markdown
## ✅ 최종 스토리 Preview

**제목:** [스토리 제목 — 30자 이내 명확한 명사구]

**설명:**
As a [페르소나],
I want to [기능/행동],
so that [사용자 가치].

[검증할 가정이 있으면]
> 검증할 가정: [가정 내용]

**인수 기준:**
- GIVEN [조건] WHEN [행동] THEN [결과]
- GIVEN [조건] WHEN [행동] THEN [결과]
...

**레이블:** [레이블1], [레이블2]

---
TrackerBoot에 등록할까요?
→ "commit" / "register" / "등록" — 등록 실행
→ "edit [섹션]" — 해당 섹션 수정 (title / description / ac / labels)
→ "cancel" — 취소
```

PAUSE.

---

## Step 6: TrackerBoot 등록

개발자가 확인하면 TrackerBoot MCP로 스토리를 등록한다.

### MCP 도구 패턴 (순서대로 시도)

```
mcp__trackerboot__create_story
mcp__trackerboot__add_story
mcp__trackerboot__story_create
mcp__pivotal__create_story
mcp__tracker__create_story
```

### 등록 페이로드

`project_id`는 반드시 포함한다.

```json
{
  "project_id": "[Step 0에서 저장한 project-id]",
  "name": "[스토리 제목]",
  "description": "[As a / I want / so that 전체 텍스트]",
  "story_type": "feature",
  "labels": ["[레이블1]", "[레이블2]"],
  "tasks": [
    { "description": "GIVEN [...] WHEN [...] THEN [...]" },
    ...
  ]
}
```

### 등록 성공

```
✅ 스토리 등록 완료

**ID:** [스토리 ID]
**제목:** [스토리 제목]

→ /tdd-plan [스토리 ID] 로 TDD 세션을 시작할 수 있습니다.
```

### 등록 실패

```
❌ TrackerBoot 등록 실패: [오류 메시지]

→ "retry" — 다시 시도
→ "copy" — 스토리 내용을 클립보드 형식으로 출력
→ "cancel" — 취소
```

"copy" 선택 시 — Markdown 형식으로 전체 스토리를 출력한다.

---

## 참조 파일

| 파일 | 사용 시점 |
|------|---------|
| `.agents/skills/write-story/references/persona.md` | Step 0에서 로드 (필수) |
| `.agents/skills/write-story/references/value-proposition.md` | Step 0에서 로드 (선택) |
| `.agents/skills/write-story/references/story-format-guide.md` | Step 2 스토리 초안 작성 시 |
| `.agents/skills/write-story/references/ac-writing-guide.md` | Step 3 AC 작성 시 |
