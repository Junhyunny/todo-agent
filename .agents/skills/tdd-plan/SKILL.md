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

이 단계에서는 **프로젝트 전체를 바로 다시 검색하지 않습니다.**
먼저 프로젝트 루트의 `ARCHITECTURE.md` 존재 여부를 확인하고, 파일이 있으면 **그 파일만 읽어 사용합니다**.

### 수행 순서

1. `ARCHITECTURE.md`가 있으면 그 파일을 읽는다
2. 파일이 **없을 때만** 현재 프로젝트를 직접 스캔해 `ARCHITECTURE.md`를 생성한다
3. 생성 또는 기존 `ARCHITECTURE.md`의 `## 스택 요약`과 필요한 영역 섹션에서 다음 값을 추출한다:
   - **Stack**
   - **Unit test framework**
   - **E2E framework**
   - **작업 대상 경로/영역**
4. 모노레포라면 현재 스토리와 가장 관련된 영역을 선택한다

### 이미 파일이 있는 경우

- `ARCHITECTURE.md`가 존재하면 **프로젝트 파일을 다시 스캔하지 않습니다**
- 개발자가 명시적으로 `update stack`을 요청한 경우에만 다시 갱신합니다

### 파일이 없거나 읽을 수 없는 경우

`ARCHITECTURE.md`가 없어서 현재 프로젝트를 스캔한 뒤에도 파일을 준비하지 못하면 중단한다:

```
❌ 기술 스택 파일을 준비하지 못했습니다.

현재 프로젝트의 빌드 파일과 소스 구조를 확인해 `ARCHITECTURE.md`를 먼저 준비한 뒤 다시 시도해주세요.
```

세부 감지 규칙은 `references/tech-stack-detection.md`를 참조하세요.

---

## Step 3: 프로젝트 컨벤션 감지

먼저 프로젝트 루트의 `CONVENTIONS.md` 존재 여부를 확인합니다.

### 이미 파일이 있는 경우

- `CONVENTIONS.md`가 있으면 **그 파일만 읽어 사용합니다**
- 이 경우 프로젝트 소스/테스트 파일을 다시 검색하지 않습니다
- 개발자가 명시적으로 `update conventions`를 요청한 경우에만 다시 스캔합니다

### 파일이 없는 경우

**기존 테스트 또는 소스 파일이 없는 경우(새 프로젝트) 이 단계를 건너뜁니다.**

`CONVENTIONS.md`가 없을 때만 `ARCHITECTURE.md`에서 선택된 영역을 기준으로, 스토리와 같은 영역의 테스트 파일 2~3개와 소스 파일 1~2개를 읽습니다. 최근 수정된 파일을 선호합니다.

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

전체 컨벤션 규칙은 `references/convention-detection.md`를 참조하세요.

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

### 프론트엔드-백엔드 경계 태스크 규칙

스토리에 **프론트엔드와 백엔드가 모두 등장**하고, UI 동작이 서버 데이터에 의존하면, 엔드포인트 구현과 별도로 **실제 API 호출 연결 태스크**가 반드시 포함되어야 합니다.

- 백엔드 엔드포인트 구현 태스크만 만들고 끝내지 않습니다
- 프론트 UI 렌더링 태스크만 만들고, API 호출 연결을 암묵적으로 포함시키지 않습니다
- 다음 항목 중 하나 이상이 **명시적인 태스크 제목/범위**로 보여야 합니다:
  - OpenAPI 스펙 export / 클라이언트 재생성
  - generated client(orval/axios 등) 사용 또는 갱신
  - frontend service/repository/hook/preload bridge에서 실제 API 호출 연결
  - 저장 후 목록 재조회, invalidation, refresh 같은 서버 동기화 흐름

예를 들어, "저장하면 리스트에 반영된다" 유형의 스토리는 보통 아래 경계 태스크를 포함합니다:

1. 백엔드 write endpoint
2. 백엔드 read endpoint
3. 프론트에서 create API 호출 연결
4. 프론트에서 list API 호출 연결
5. 필요하면 preload/electron bridge 또는 API client generation

**계획 검증 체크:**
- 프론트와 백엔드가 모두 필요한 스토리라면, 초안 확정 전에 "브라우저/UI 코드가 실제로 어떤 클라이언트/서비스를 통해 서버와 통신하는지"를 태스크 목록에서 한 번 더 확인합니다
- 이 연결 태스크가 빠졌다면 초안을 확정하지 말고 보완합니다

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
- **API Client:** [client or "—"]
- **Spec path:** [path or "—"]

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

세션 파일 작성이 끝나면, 다음 작업으로 넘어가기 전에 필요하면 `/context`로 사용량을 확인하고 `/compact`로 압축할 수 있다고 **짧게 안내만 남깁니다**.

- 에이전트는 `/context`, `/compact`를 직접 실행하지 않습니다.
- 이 안내 때문에 다음 작업 진행을 멈추지 않습니다.

표시는 짧게 유지합니다:

```markdown
Optional: before starting the next task, review the relevant context usage with `/context` and compress it with `/compact` in the CLI.
Then start Task 1 with your preferred workflow.
```
