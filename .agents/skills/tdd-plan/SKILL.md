---
name: tdd-plan
description: >
  Use this skill when the user says "tdd plan", "plan tdd", "start tdd session",
  "TDD 플랜", "TDD 세션 시작", or wants to plan a TDD session for a story.
  Fetches a story from TrackerBoot MCP or accepts pasted content, syncs the shared
  tech-stack file and conventions, plans task decomposition, and writes the
  .tdd-sessions/ file.
---

# TDD Plan

## Invocation

```
/tdd-plan <project-id> <story-id>
/tdd-plan <project-id> "full story content"
```

- **`project-id`** — TrackerBoot 프로젝트 ID **(필수)**
- **`story-id`** — TrackerBoot 스토리 ID (숫자형, 예: `12345678` 또는 `#12345678`) → MCP를 통해 가져오기
- **`"full story content"`** — 스토리 텍스트를 직접 붙여넣기 → 직접 사용
- **project-id 없음** → 오류를 표시하고 중지: "프로젝트 ID가 필요합니다. TrackerBoot 프로젝트 ID를 첫 번째 인수로 제공하세요."
- **story-id/content 없음** → 오류를 표시하고 중지: "스토리가 필요합니다. TrackerBoot 스토리 ID를 제공하거나 스토리 내용을 붙여넣으세요."

---

## Step 1: 스토리 불러오기

### 인수 검증

호출 시 `project-id`와 `story-id` (또는 스토리 텍스트)가 모두 제공되었는지 확인한다.

**`project-id`가 없으면 즉시 중단:**

```
❌ TrackerBoot 프로젝트 ID가 필요합니다.

프로젝트 ID 없이 실행하면 권한이 있는 임의의 프로젝트에서 스토리를 조회할 수 있습니다.

사용법: /tdd-plan <project-id> <story-id>
        /tdd-plan <project-id> "스토리 내용"
예시:   /tdd-plan 99887766 12345678
```

STOP.

**`story-id` 또는 스토리 텍스트가 없으면 즉시 중단:**

```
❌ 스토리가 필요합니다.

TrackerBoot 스토리 ID를 제공하거나 스토리 내용을 붙여넣으세요.

사용법: /tdd-plan <project-id> <story-id>
        /tdd-plan <project-id> "스토리 내용"
```

STOP.

**모두 제공되었으면:** `project-id`를 세션 전체에서 사용할 값으로 저장한다.

### 스토리 ID가 제공된 경우

`tracker-boot-mcp-tb_get_story` 도구를 사용하여 스토리를 페치합니다:

```json
{
  "storyId": 12345678
}
```

호출 전 앞에 있는 `#`을 제거합니다 (`#12345678` → `12345678`).

응답에서 추출:
- **제목:** `name` 필드
- **설명:** `description` 필드
- **인수 기준:** `tasks[]` 배열 (권장) 또는 설명의 "Acceptance Criteria:" 섹션 파싱
- **상태:** `current_state` 필드

**MCP 도구를 찾을 수 없거나 호출이 실패한 경우:**
```
"Could not fetch story [ID] from TrackerBoot.
Please check that the TrackerBoot MCP server is configured, then try again,
or paste the story content directly."
```
**중지 — 진행하지 마십시오.**

### 스토리 내용을 붙여넣은 경우

직접 파싱 — 텍스트에서 제목, 설명, 인수 기준을 추출합니다.

### 개발자에게 확인

스토리를 표시하고 일시 정지:

```markdown
## Story

**ID:** [id or "—"]
**Title:** [title]

**Description:**
[description]

**Acceptance Criteria:**
- [ ] [AC 1]
- [ ] [AC 2]
...

---
Does this look correct? Type "ok" to continue, or let me know what to fix.
```

"ok" / "yes" / "looks good"를 기다립니다.

- 승인 입력이면 전체 스토리를 다시 출력하지 않고 `✅ 스토리 확인됨. 기술 스택 확인으로 진행합니다.`처럼 **짧게 전환만 표시**합니다.
- 수정 요청이면 **수정된 항목만 다시 표시**합니다.
- 전체 내용을 다시 보여주는 것은 개발자가 명시적으로 요청한 경우에만 합니다.

---

## Step 2: 기술 스택 감지

이 단계에서는 직접 프로젝트 전체를 다시 해석하지 말고, 먼저 **`/sync-tech-stack` 스킬을 호출**해
프로젝트 루트의 `.agents/tech-stack.md`를 최신 상태로 만든다.

### 수행 순서

1. `/sync-tech-stack`를 호출한다
2. 생성 또는 갱신된 `.agents/tech-stack.md`를 읽는다
3. 이 파일의 `## 스택 요약`과 필요한 영역 섹션에서 다음 값을 추출한다:
   - **Stack**
   - **Unit test framework**
   - **E2E framework**
   - **작업 대상 경로/영역**
4. 모노레포라면 현재 스토리와 가장 관련된 영역을 선택한다

### 파일이 없거나 읽을 수 없는 경우

`/sync-tech-stack` 실행 후에도 `.agents/tech-stack.md`가 없으면 중단한다:

```
❌ 기술 스택 파일을 준비하지 못했습니다.

먼저 /sync-tech-stack 으로 `.agents/tech-stack.md`를 생성한 뒤 다시 시도해주세요.
```

전체 연결 규칙은 `.agents/skills/tdd-plan/references/tech-stack-detection.md`를 참조하세요.

---

## Step 3: 프로젝트 컨벤션 감지

**기존 테스트 또는 소스 파일이 없는 경우(새 프로젝트) 이 단계를 건너뜁니다.**

`.agents/tech-stack.md`에서 선택된 영역을 기준으로, 스토리와 같은 영역의 테스트 파일 2~3개와 소스 파일 1~2개를 읽습니다. 최근 수정된 파일을 선호합니다.

추출:
- 테스트 파일 위치 (동일 위치 vs `test/` 디렉토리)
- 테스트 파일 명명 접미사 (`*.test.ts`, `*Test.kt`, `test_*.py`)
- 테스트 구조 (describe/it 중첩, `@Nested`, 클래스 기반)
- 어서션 라이브러리 및 스타일
- 목 패턴 (vi.mock, vi.fn injection, mockk, @MockBean, MagicMock)
- 소스 파일의 의존성 주입 패턴
- 명명 컨벤션 (접미사, 대소문자)

간략한 요약을 표시합니다 (일시 정지 없음 — 정보 제공 목적):

```markdown
## Project Conventions Detected

Files read: [file list]

- **Test location:** [co-located / test/ directory]
- **Test naming:** [pattern]
- **Test structure:** [describe/it / @Nested / class-based]
- **Assertions:** [expect().toEqual / assertThat / assert ==]
- **Mocks:** [vi.mock / vi.fn injection / mockk / MagicMock]
- **Source structure:** [feature-based / layer-based]

All new code will follow these patterns.
```

전체 컨벤션 규칙은 `.agents/skills/tdd-plan/references/convention-detection.md`를 참조하세요.

---

## Step 4: 태스크 분해 제안

세션 상태를 표시한 후 태스크를 제안합니다:

```markdown
---
## 🏓 Session State
| Field | Value |
|-------|-------|
| Story | [ID]: [title] |
| Stack | [stack] |
| Test FW | [test framework] |
| E2E FW | [e2e framework] |
| Conventions | [new project / existing — key patterns] |
| Phase | PLANNING |
---

## Task Plan (Draft)

### Task List

#### Task 1: [title]
- **Type:** unit | integration | e2e
- **The test will assert:** [one sentence]
- **Implementation scope:** [what code will be written]
- **Acceptance criteria link:** [which ACs]
- **Dependencies:** none

#### Task 2: [title]
...

#### Task [N] (E2E): [title]
- **Type:** e2e
- **The test will assert:** [full user flow]
- **Implementation scope:** E2E test only
- **Acceptance criteria link:** Full AC coverage check
- **Dependencies:** Task [N-1]

---
**Questions for clarification:**
1. [ambiguity or scope question]

---
Please review. You can add, remove, reorder, or adjust tasks.
Type **"ready"**, **"go"**, or **"approved"** when satisfied.
```

### 태스크 순서 결정 기준
1. 도메인/서비스 레이어 우선 (순수 로직, 단위 테스트하기 가장 쉬움)
2. 레포지토리/데이터 레이어 두 번째 (영속성)
3. API/컨트롤러 레이어 세 번째 (HTTP 인터페이스)
4. E2E 마지막 (전체 흐름 검증)

### 피드백 후

태스크 목록을 업데이트할 때는 다음 규칙을 따릅니다:

- **최초 1회만 전체 초안**을 표시합니다.
- 이후 피드백 반영 시에는 **변경된 태스크/질문만 다시 표시**합니다.
- `ready` / `go` / `approved` / `looks good`가 들어오면 전체 계획을 반복 출력하지 않고
  `✅ 태스크 계획 확정. 세션 파일을 작성합니다.`처럼 **짧게 전환만 표시**합니다.
- 전체 초안을 다시 보여주는 것은 개발자가 `show full plan`처럼 요청한 경우에만 합니다.

트리거 문구를 받을 때까지 반복합니다:
`ready` / `go` / `approved` / `looks good`

---

## Step 5: 세션 파일 작성

### 세션 파일 경로 결정

세션 파일은 프로젝트 루트의 `.tdd-sessions/`에 저장됩니다. 파일 이름은 스토리 ID를 기반으로 합니다:

| 상황 | 파일 이름 |
|-----------|----------|
| 스토리 ID 사용 가능 (예: `12345678`) | `.tdd-sessions/12345678.md` |
| 스토리 ID 없음 (붙여넣은 내용) | `.tdd-sessions/{title-slug}-{YYYY-MM-DD}.md` |

**제목 슬러그:** 소문자, 공백 및 특수 문자는 하이픈으로 대체, 최대 40자.
예: "User Profile Update" → `user-profile-update` → `.tdd-sessions/user-profile-update-2026-03-31.md`

### `.tdd-sessions/`를 `.gitignore`에 추가

세션 파일을 작성하기 전에:

1. 프로젝트 루트에 `.gitignore`가 존재하는지 확인
2. `.tdd-sessions/` (또는 `.tdd-sessions`)가 이미 목록에 있는지 확인
3. 목록에 없는 경우:
   - `.gitignore`가 존재하는 경우: 파일에 `.tdd-sessions/` 줄을 추가
   - `.gitignore`가 존재하지 않는 경우: `.tdd-sessions/`를 단일 항목으로 포함하여 생성
4. 표시: "`.tdd-sessions/`를 `.gitignore`에 추가했습니다" (또는 "`.tdd-sessions/`가 이미 `.gitignore`에 있습니다")

### 세션 파일 작성

`.tdd-sessions/` 디렉토리가 없으면 생성한 후 파일을 작성합니다:

```markdown
# TDD Session

## Meta
- **Story ID:** [id or "—"]
- **Story Title:** [title]
- **Stack:** [stack]
- **Test FW:** [framework]
- **E2E FW:** [framework]
- **Conventions:** [summary line]

## Tasks
| # | Title | Type | Status |
|---|-------|------|--------|
| 1 | [title] | unit | ⏳ pending |
| 2 | [title] | integration | ⏳ pending |
| 3 | [title] | e2e | ⏳ pending |

## Task Details

### Task 1: [title]
- **Type:** unit
- **The test will assert:** [assertion description]
- **Implementation scope:** [scope]
- **Acceptance criteria link:** [AC reference]
- **Dependencies:** none
- **Status:** ⏳ pending

### Task 2: [title]
...
```

그런 다음 표시:

```markdown
## ✅ Session Ready

`.tdd-sessions/[filename]` created with [N] tasks.
```

세션 파일 작성이 끝나면, 다음 긴 작업(`/tdd-task`)으로 넘어가기 전에 먼저:

```text
/context
/compact
/context
```

를 **반드시 순서대로 실행**해 계획 단계에서 쌓인 컨텍스트 사용량을 확인하고 압축합니다.

- 이 단계는 선택 사항이 아닙니다.
- **압축 후 `/context` 결과를 보여주기 전에는** `Run **/tdd-task** to start Task 1.` 안내로 넘어가지 않습니다.
- 계획 결과를 출력한 직후 곧바로 종료하지 말고, 위 순서를 마친 뒤 마무리합니다.

표시는 짧게 유지합니다:

```markdown
📊 Context before compact shown.
🧹 Planning context compacted.
📊 Context after compact shown.
Run **/tdd-task** to start Task 1.
```
