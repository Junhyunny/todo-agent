---
name: write-story
description: >
  XP 프랙티스에 맞는 사용자 스토리를 AI와 대화 형식으로 함께 작성하고
  TrackerBoot(MCP)에 자동 등록하는 스킬.
version: 2.0.0
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
/write-story <project-id>
```

- **`project-id`** — TrackerBoot 프로젝트 ID **(필수)**

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

사용법: /write-story <project-id>
예시:   /write-story 12345678
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
- **없으면:** 스토리 분리 시 AI가 가치를 직접 추론한다. (중단하지 않음)

---

## Step 1: 시나리오 수집

사전 조건이 모두 통과되면, 사용자에게 시나리오를 요청한다.

```
구상하고 계신 사용자 시나리오를 설명해주세요.

누가 어떤 상황에서 무엇을 하려는지 자유롭게 서술해주시면 됩니다.
하나의 시나리오를 작은 스토리들로 나눠드리겠습니다.

예시:
  "쇼핑몰에서 사용자가 상품을 장바구니에 담고, 결제 수단을 선택한 뒤,
   주문을 완료하고 확인 이메일을 받는 전체 흐름"
```

PAUSE.

---

## Step 2: 스토리 분리

수집한 시나리오를 분석하여 **INVEST 원칙**에 따라 독립적인 스토리들로 나눈다.

### 분리 기준

분리 상세 규칙은 `.agents/skills/write-story/references/story-splitting-guide.md` 참조.

각 스토리가 다음을 만족하는지 검토한다:
- **Independent**: 다른 스토리에 의존하지 않고 독립적으로 전달 가능한가?
- **Valuable**: 기술적 수평 분할이 아닌 사용자에게 실질적인 가치를 전달하는가?
- **Small**: 하나의 이터레이션 안에서 완료할 수 있을 만큼 작은가?
- **Testable**: 인수 기준을 작성할 수 있는가?

### 분리 결과 표시 형식

```
## 📋 스토리 분리 결과

시나리오를 [N]개의 스토리로 나눴습니다.

---

**[1] [스토리 제목]**
As a [페르소나], I want to [기능], so that [가치].
> 분리 이유: [왜 이 단위로 나눴는지]

**[2] [스토리 제목]**
As a [페르소나], I want to [기능], so that [가치].
> 분리 이유: [왜 이 단위로 나눴는지]

...

---
이 분리가 적절한가요?
→ "ok" / "yes" — 다음 단계로
→ "split [번호]" — 해당 스토리를 더 잘게 나눔
→ "merge [번호] [번호]" — 두 스토리를 합침
→ "add" — 시나리오에 없는 스토리 추가
→ "remove [번호]" — 해당 스토리 제거
→ "edit [번호]" — 해당 스토리 수정
```

PAUSE. 변경 사항 반영 후 재표시. "ok" / "yes" / "좋아" 를 받으면 진행.

---

## Step 3: 인수 기준 작성

확정된 스토리 목록의 각 스토리에 대해 순서대로 AC를 작성한다.

### 진행 방식

스토리를 하나씩 처리한다. 각 스토리마다:

1. 현재 처리 중인 스토리를 상단에 표시한다:

```
## ✏️ AC 작성 중 ([현재 번호] / [전체 수])

**[스토리 제목]**
As a [페르소나], I want to [기능], so that [가치].
```

2. GIVEN/WHEN/THEN 형식으로 AC를 제안한다.

### 제안 순서

1. **해피 패스** — 정상적인 주요 흐름 먼저
2. **엣지 케이스** — 경계값, 예외 흐름
3. **오류 케이스** — 잘못된 입력, 시스템 오류

### 제안 형식

```markdown
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
→ "done" / "ok" — 이 스토리 완료, 다음 스토리로
→ "skip all" — 나머지 스토리 AC 생략하고 Step 4로
```

PAUSE. 변경 사항 반영 후 재표시. "done" / "ok" 를 받으면 다음 스토리로 진행.

모든 스토리 AC 완료 후 자동으로 Step 4로 진행한다.

AC 작성 상세 규칙은 `.agents/skills/write-story/references/ac-writing-guide.md` 참조.

---

## Step 4: 레이블 및 관련 스토리 조회

### 4-1. 레이블 후보 제안

전체 스토리 목록을 분석하여 공통 레이블 후보를 제안한다.
각 스토리에 개별 레이블이 필요하면 함께 제안한다.

```
스토리에 적용할 레이블을 선택해주세요.

공통 레이블 추천: [레이블1], [레이블2]
개별 레이블 추천:
  - [스토리 1]: [레이블]
  - [스토리 2]: [레이블]

"ok" / "done"을 입력하면 확정됩니다.
추가/제거하고 싶으면 알려주세요.
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
📋 기존 관련 스토리 (레이블: "[레이블]")
- [[스토리 ID]] [스토리 제목]
- [[스토리 ID]] [스토리 제목]

중복이나 겹치는 스코프가 있는지 확인합니다.
```

AI는 조회된 기존 스토리와 새로 작성 중인 스토리들의 중복 여부를 검토한다.
중복이 발견되면 개발자에게 알리고 해당 스토리를 제거하거나 스코프를 조정한다.

**관련 스토리가 없으면:** 조용히 진행한다.

---

## Step 5: 최종 확인

완성된 전체 스토리 목록을 표시하고 최종 승인을 받는다.

```markdown
## ✅ 최종 스토리 Preview ([N]개)

---

### [1] [스토리 제목]
**설명:**
As a [페르소나], I want to [기능], so that [가치].

**인수 기준:**
- GIVEN [조건] WHEN [행동] THEN [결과]
- GIVEN [조건] WHEN [행동] THEN [결과]

**레이블:** [레이블1], [레이블2]

---

### [2] [스토리 제목]
...

---

TrackerBoot에 [N]개 스토리를 등록할까요?
→ "commit" / "register" / "등록" — 전체 등록 실행
→ "register [번호]" — 해당 스토리만 등록
→ "edit [번호] [섹션]" — 해당 스토리의 섹션 수정 (title / description / ac / labels)
→ "cancel" — 취소
```

PAUSE.

---

## Step 6: TrackerBoot 등록

개발자가 확인하면 TrackerBoot MCP로 스토리를 **순서대로 하나씩** 등록한다.

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

### 등록 진행 표시

각 스토리 등록 후 진행 상황을 표시한다:

```
✅ [1/N] [스토리 제목] — 등록 완료 (ID: [스토리 ID])
✅ [2/N] [스토리 제목] — 등록 완료 (ID: [스토리 ID])
...
```

### 전체 등록 완료

```
✅ 전체 [N]개 스토리 등록 완료

등록된 스토리:
- [스토리 ID] [스토리 제목]
- [스토리 ID] [스토리 제목]
...

→ /tdd-plan <project-id> <story-id> 로 각 스토리의 TDD 세션을 시작할 수 있습니다.
```

### 등록 실패

특정 스토리 등록에 실패하면:

```
❌ [N번 스토리] 등록 실패: [오류 메시지]

→ "retry" — 다시 시도
→ "skip" — 이 스토리 건너뛰고 다음으로
→ "copy" — 해당 스토리 내용을 Markdown 형식으로 출력
→ "cancel" — 전체 등록 중단
```

---

## 참조 파일

| 파일 | 사용 시점 |
|------|---------|
| `.agents/skills/write-story/references/persona.md` | Step 0에서 로드 (필수) |
| `.agents/skills/write-story/references/value-proposition.md` | Step 0에서 로드 (선택) |
| `.agents/skills/write-story/references/story-splitting-guide.md` | Step 2 스토리 분리 시 |
| `.agents/skills/write-story/references/story-format-guide.md` | Step 2 스토리 초안 형식 |
| `.agents/skills/write-story/references/ac-writing-guide.md` | Step 3 AC 작성 시 |
