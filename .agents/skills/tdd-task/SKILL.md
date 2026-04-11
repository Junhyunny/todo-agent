---
name: tdd-task
description: >
  Use this skill when the user says "tdd task", "next tdd task", "run tdd",
  "TDD 태스크", "다음 태스크", or wants to run a TDD RED-GREEN-REFACTOR cycle.
  Reads the active .tdd-sessions/ file, finds the current pending task,
  and runs the full ping-pong TDD cycle with the developer.
---

# TDD Task

## Invocation

```
/tdd-task [story-id]
```

- **인수 없음** — `.tdd-sessions/`에서 활성 세션 파일을 자동 감지
- **스토리 ID 제공** — `.tdd-sessions/{story-id}.md`를 직접 사용

---

## 시작 시: 세션 파일 찾기

### 인수 없이

1. `.tdd-sessions/`의 파일 목록 나열
2. **디렉토리가 존재하지 않거나 비어 있는 경우:**
   ```
   "No active TDD session found. Run /tdd-plan first to create a session."
   ```
   중지.
3. **파일이 정확히 하나만 있는 경우:** 해당 파일 사용
4. **여러 파일이 있는 경우:**
   ```
   "Multiple sessions found. Which story are you working on?
   [1] 12345678.md — User Profile Update
   [2] user-profile-update-2026-03-31.md — (no ID)
   Type the number or story ID."
   ```
   일시 정지하고 선택을 기다립니다.

### 파일을 찾은 후

세션 파일을 읽습니다. **모든 태스크가 이미 ✅ 완료된 경우:**
```
"All tasks in this session are complete. Run /tdd-commit to review and commit."
```
중지.

상태가 `⏳ pending`인 첫 번째 태스크를 찾아 파일에서 `🔄 active`로 표시합니다.

---

## 기술 스택 파일 준비

세션 파일을 찾은 직후, 기술 스택 파일을 로드 또는 생성합니다.
기술 스택 파일은 팀 전체가 공유할 수 있도록 `.agents/tech-stack.md`에 저장합니다.

### 기존 기술 스택 파일이 있는 경우

`.agents/tech-stack.md`가 존재하면:
- 파일을 읽어 현재 컨텍스트에 로드합니다
- 표시: `🧭 기술 스택 로드됨 (.agents/tech-stack.md)`
- 세션 내내 스택/프레임워크 판단의 기준으로 사용합니다

### 기술 스택 파일이 없는 경우

`.agents/tech-stack.md`가 없으면:
- **`/sync-tech-stack` 스킬을 호출해 파일을 생성합니다**
- 생성 후 파일을 읽어 현재 컨텍스트에 로드합니다
- 생성에 실패하면 중단합니다

표시:
```
🧭 기술 스택 파일 준비 완료 → .agents/tech-stack.md
```

### 기술 스택이 바뀌었을 때

개발자가 `update stack` 또는 `refresh stack`을 입력하면:
1. `/sync-tech-stack`를 다시 호출합니다
2. `.agents/tech-stack.md`를 다시 읽습니다
3. 표시: `✅ 기술 스택 파일 갱신됨 (.agents/tech-stack.md)`
4. 이어서 필요하면 컨벤션 파일도 갱신합니다

---

## 코딩 컨벤션 준비

세션 파일을 찾은 직후, 코딩 컨벤션을 로드 또는 생성합니다.
컨벤션 파일은 팀 전체가 공유할 수 있도록 `.agents/coding-conventions.md`에 저장합니다.

### 기존 컨벤션 파일이 있는 경우

`.agents/coding-conventions.md`가 존재하면:
- 파일 전체를 읽어 현재 컨텍스트에 로드합니다
- 표시: `📋 코딩 컨벤션 로드됨 (.agents/coding-conventions.md)`
- 세션 내내 이 파일의 모든 규칙을 따릅니다

### 기존 컨벤션 파일이 없는 경우 (최초 실행)

`.agents/tech-stack.md`를 기준으로 팀 컨벤션을 파악합니다.
상세 절차는 `references/coding-conventions-template.md`의 "생성 규칙"을 따릅니다.

**① 기존 코드가 있는 경우** (소스/테스트 파일 발견):

1. `.agents/tech-stack.md`의 스택 요약에서 감지된 각 영역을 읽습니다
2. 각 스택 영역별로 소스/테스트 파일을 스캔하여 팀 컨벤션을 추출합니다
   - 각 스택 영역에서 최근 수정된 테스트 파일 5~10개, 소스 파일 3~5개를 읽습니다
   - 코드 스타일 설정 파일 (`.eslintrc`, `detekt.yml`, `pyproject.toml` 등)도 함께 참조합니다
3. 추출 결과를 스택별 섹션으로 분리하여 `.agents/coding-conventions.md`로 저장합니다

표시:
```
📋 프로젝트 컨벤션 분석 완료 → .agents/coding-conventions.md 생성

참조한 기술 스택:
- [예: Frontend] TypeScript + React (frontend/)
- [예: Backend] Kotlin + Spring (backend/)

스택별 주요 규칙이 파일에 정리되었습니다.
세션 진행 중 "add rule [내용]"으로 언제든지 추가할 수 있습니다.
```

**② 새 프로젝트인 경우** (소스/테스트 파일 없음):

`.agents/tech-stack.md`에 기록된 스택을 기준으로, `references/coding-conventions-template.md`의 파일 구조 템플릿에 정의된 **모든 섹션을 채워** 초기 컨벤션 파일을 생성합니다.
각 스택의 일반적인 베스트 프랙티스와 안티패턴을 기반으로 하되, 모든 항목에 `[기본값]` 태그를 붙여 실제 코드 분석값과 구분합니다.

표시:
```
📋 새 프로젝트 감지 — 기본 컨벤션 가이드 생성 → .agents/coding-conventions.md

기술 스택 파일에 기록된 스택의 일반적인 베스트 프랙티스와 안티패턴을 초기값으로 설정했습니다.
세션 진행 중 "add rule [내용]"으로 프로젝트에 맞게 업데이트할 수 있습니다.
```

---

## 세션 상태 블록

필요한 시점에만 렌더링합니다. `.tdd-session.md`에서 값을 읽습니다.

### 출력 최적화 규칙

- **현재 태스크 시작 시** 전체 세션 상태 블록을 표시합니다
- **Phase Owner가 바뀌는 시점**에는 필요한 경우에만 전체 블록 대신 `Phase / Owner / Current Task / Next Action`만 짧게 표시합니다
- `yes`, `ok`, `confirm`, `red confirmed`, `green confirmed`, `skip` 같은 짧은 응답 뒤에는 **이전 요약 전체를 다시 출력하지 않습니다**
- 확인 후에는 `✅ RED 확인됨. GREEN 담당을 선택해주세요.`처럼 **짧은 전환 메시지**만 표시합니다
- 전체 상태 블록이나 긴 요약은 개발자가 `show status`, `show task`, `show full`처럼 요청한 경우에만 다시 표시합니다

### 컨텍스트 압축 규칙

- **초기 분석/준비(스택 파일, 컨벤션 파일, 현재 태스크 파악) 완료 후** RED에 들어가기 전에 `/context → /compact → /context` 순서로 실행합니다
- **현재 태스크가 `✅ done`으로 끝난 뒤** 다음 태스크 또는 `/tdd-commit`으로 넘어가기 전에 `/context → /compact → /context` 순서로 실행합니다
- 같은 태스크의 RED/GREEN/REFACTOR 사이클 중간에는 `/compact`를 남발하지 않습니다
- 압축 후에는 전체 상태를 다시 길게 출력하지 않고 짧은 전환만 표시합니다

```markdown
---
## 🏓 Session State
| Field        | Value |
|--------------|-------|
| Story        | [ID]: [title] |
| Stack        | [stack] |
| Test FW      | [framework] |
| E2E FW       | [framework] |
| Stack File   | 🧭 .agents/tech-stack.md |
| Conventions  | 📋 .agents/coding-conventions.md |
| Phase        | RED / GREEN / REFACTOR |
| Current Task | [N] of [total]: [task title] |
| Phase Owner  | DEV / AI |
| Next Action  | [one-line description] |
---

### Task Progress
| # | Title | Type | Status |
|---|-------|------|--------|
| 1 | [title] | unit | ✅ done / 🔄 active / ⏳ pending |
...
```

---

## 태스크 시작 전: 필요 기술 스택 점검

태스크 세부 내용을 읽은 뒤, **이 태스크를 구현하는 데 프로젝트에 아직 없는 기술이 필요한지** 판단합니다.

### 점검 기준

아래 유형의 기술이 필요한데 프로젝트에 없거나 설정되지 않은 경우 해당합니다:

| 필요 기능 | 대표 예시 |
|----------|---------|
| 외부 API 호출 | HTTP 클라이언트 (Axios, Retrofit, httpx …) |
| 데이터 영속성 | ORM / DB 드라이버 (JPA, Prisma, SQLAlchemy …) |
| 인증/인가 | JWT, OAuth, Spring Security … |
| 메시지 큐 | Kafka, RabbitMQ, SQS … |
| 캐시 | Redis, Caffeine … |
| 파일/스토리지 | S3, MinIO … |
| 스케줄링 | Quartz, cron, Celery … |

### 새 기술 스택이 필요한 경우

1. 태스크 내용, 현재 프로젝트 스택, 팀 규모/컨텍스트를 고려해 **가장 적합한 기술을 추천 이유와 함께 제안**합니다.

   ```
   🔍 이 태스크([task title])를 구현하려면 [기능]이 필요합니다.
   현재 프로젝트에 관련 라이브러리가 없습니다.

   추천: [라이브러리/프레임워크 이름]
   이유: [프로젝트 스택·규모·컨벤션을 고려한 선택 근거 1~2줄]

   대안:
   - [대안 A] — [한 줄 특징]
   - [대안 B] — [한 줄 특징]

   → 추천대로 진행하려면 "ok" 또는 "yes [라이브러리명]"
   → 다른 것을 선택하려면 라이브러리명을 직접 입력
   → 나중에 직접 설치하려면 "skip"
   ```

2. 일시 정지하고 기다립니다.

3. 선택이 결정되면:
   - 해당 기술의 설치 명령어와 기본 설정 스니펫을 제공합니다
   - `/sync-tech-stack`를 다시 호출해 `.agents/tech-stack.md`를 갱신합니다
   - `.agents/coding-conventions.md`의 해당 스택 섹션도 함께 갱신합니다
   - `✅ 스택 결정됨. RED 담당 확인으로 진행합니다.`처럼 짧게 표시한 뒤 RED 단계로 진행합니다

### 기존 기술로 충분한 경우

별도 안내 없이 바로 RED 담당 확인으로 진행합니다.

---



현재 태스크 세부 사항을 표시한 후, **각 페이즈에 들어가기 직전에 그 페이즈의 작업 주체를 다시 확인합니다.**

### 페이즈 담당 확인 규칙

- RED에 들어가기 전: 누가 실패하는 테스트를 작성할지 묻습니다
- GREEN에 들어가기 전: 누가 최소 구현을 작성할지 묻습니다
- REFACTOR에 들어가기 전: 누가 리팩토링을 수행할지 묻습니다
- **AI는 해당 페이즈에서 명시적으로 선택된 경우에만 파일을 수정합니다**
- 특히 **GREEN에서는 "you"를 받은 경우에만 AI가 구현 파일을 작성합니다**

처음에는 RED 담당만 확인합니다:

```
Task [N]: [title]
Type: [unit/integration/e2e]
The first test will assert: [assertion description]

Who handles RED for this cycle?
→ **"me"** — I'll write it
→ **"you"** — AI writes it
```

이 RED 진입 직전에 먼저:

```text
/context
/compact
/context
```

를 순서대로 실행합니다.

표시는 짧게 유지합니다:

```markdown
📊 Context before compact shown.
🧹 Task context compacted.
📊 Context after compact shown.
Who handles RED for this cycle?
```

일시 정지하고 기다립니다.

---

## 탈출 옵션 (항상 사용 가능)

| 개발자 입력 | 효과 |
|----------------|--------|
| `skip` | 현재 페이즈를 AI가 대신 진행하거나, REFACTOR를 건너뜀 |
| `next task` | 현재 태스크를 완료로 표시하고 다음으로 이동 |
| `abort` | 세션 중지, 완료된 내용을 커밋하려면 /tdd-commit 실행 |
| `restart task` | 현재 태스크 초기화, RED부터 다시 시작 |
| `add rule [내용]` | `.agents/coding-conventions.md`의 Custom Rules에 즉시 추가 후 이후 코드에 반영 |
| `update stack` | `/sync-tech-stack`를 다시 호출해 `.agents/tech-stack.md`를 갱신 |
| `update conventions` | 지금까지 작성된 코드를 기반으로 컨벤션 파일 재스캔 및 갱신 |
| `add stack [기술명]` | 프로젝트에 새 기술 스택 추가 — AI가 설치 명령과 설정 스니펫 제공 후 스택 파일과 컨벤션 파일을 갱신 |

### `add rule` 처리 방법

개발자가 `add rule [내용]`을 입력하면:
1. `.agents/coding-conventions.md`의 `## Custom Rules` 섹션에 규칙을 추가합니다
2. 표시: `✅ 규칙 추가됨: "[내용]" — 이후 모든 코드에 적용됩니다`
3. 중단 없이 현재 단계를 계속 진행합니다

### `update stack` 처리 방법

개발자가 `update stack`을 입력하면:
1. `/sync-tech-stack`를 호출합니다
2. `.agents/tech-stack.md`를 다시 읽습니다
3. 표시: `✅ 기술 스택 파일 갱신됨 (.agents/tech-stack.md)`
4. 중단 없이 현재 단계를 계속 진행합니다

### `update conventions` 처리 방법

개발자가 `update conventions`를 입력하면:
1. `.agents/tech-stack.md`에서 현재 스택 영역 목록을 다시 읽습니다
2. 지금까지 이번 세션에서 작성된 소스/테스트 파일을 다시 읽습니다
3. 기존 컨벤션 파일과 비교해 새로운 패턴이 있으면 업데이트합니다
4. 표시: `✅ 컨벤션 파일 갱신됨 (.agents/coding-conventions.md)`
5. 중단 없이 현재 단계를 계속 진행합니다

---

## RED 단계

### AI의 턴인 경우

이 섹션은 **RED 담당이 AI로 선택된 경우에만** 실행합니다.

1. 세션 상태 블록 렌더링 (Phase: RED, Phase Owner: AI)
2. **작성 전, `.agents/coding-conventions.md`를 읽어 최신 컨벤션을 확인합니다:**
   - 테스트 파일 위치 및 명명 패턴
   - describe/test/it 구조 및 중첩 깊이
   - 어서션 라이브러리 및 스타일
   - Mock 패턴
   - 테스트 메서드 명명 컨벤션
   - Custom Rules 섹션의 개발자 정의 규칙 (최우선 적용)
3. 다음 조건을 충족하는 실패하는 테스트를 **직접 파일로 작성합니다**:
   - 프로젝트에서 감지된 컨벤션을 따릅니다 (일반적인 기본값이 아님)
   - 명확하고 동작을 설명하는 이름을 가집니다
   - 아직 존재하지 않거나 올바르지 않게 동작하는 함수/클래스/엔드포인트를 참조합니다
   - **올바른 이유**로 실패합니다: 어서션 실패 또는 심볼 누락 — 문법/import 오류가 아님
4. 파일 생성/수정 도구로 테스트를 **실제 파일에 작성합니다** (코드 블록만 표시하고 끝내지 않습니다)
5. 작성한 파일 경로와 예상 실패 출력을 표시합니다:
   ```
   ✏️ 테스트 파일 작성 완료: [정확한 파일 경로]

   예상 실패:
   [실패 메시지 예시]

   테스트를 실행하고 RED 상태(올바른 이유로 실패)를 확인해주세요.
   Type **"red confirmed"** or **"failing"** to continue.
   ```
6. 일시 정지하고 기다립니다

### 개발자의 턴인 경우

이 섹션은 **RED 담당이 DEV로 선택된 경우에만** 실행합니다.

1. 세션 상태 블록 렌더링 (Phase: RED, Phase Owner: DEV)
2. 표시:
   ```
   ## 🔴 RED — Your Turn

   Task [N]: [task title]
   Write a failing test that asserts: [assertion description]

   Paste your test code here.
   (Or type "skip" to have AI write it instead)
   ```
3. 일시 정지하고 기다립니다
4. 개발자가 코드를 붙여넣으면: 확인하고, 파일 경로를 기록하고, RED 확인 후 GREEN 담당 확인으로 진행합니다

### "올바른 이유"의 의미

```
✅ Correct RED                              ❌ Wrong RED (fix first)
─────────────────────────────────────────────────────────────────
TypeError: method is not a function         SyntaxError: Cannot find module
AssertionError: expected null to equal {...} ImportError: cannot import name
MockKException: no answer found             ClassNotFoundException
```

실패 이유가 잘못된 경우: 컴파일/import 오류를 해결하기 위해 빈 스텁(동작 없음)을 생성하고, 다시 실행한 후 RED를 확인합니다.

RED가 확인되면, 이전 RED 요약을 다시 출력하지 말고 짧게 전환한 뒤 GREEN으로 넘어가기 전에 반드시 다음을 묻습니다:

```
✅ RED 확인됨.

Who handles GREEN for this cycle?
→ **"me"** — I'll write the minimum implementation
→ **"you"** — AI writes the minimum implementation
```

일시 정지하고 기다립니다.

---

## GREEN 단계

### AI의 턴인 경우

이 섹션은 **GREEN 담당이 AI로 명시적으로 선택된 경우에만** 실행합니다.

1. 세션 상태 블록 렌더링 (Phase: GREEN, Phase Owner: AI)
2. **작성 전, `.agents/coding-conventions.md`를 읽어 최신 컨벤션을 확인합니다:**
   - 디렉토리 구조 (기능 기반 vs 레이어 기반)
   - 클래스/함수 명명 컨벤션
   - 의존성 주입 패턴
   - 어노테이션/데코레이터 스타일
   - 에러 처리 방식
   - Custom Rules 섹션의 개발자 정의 규칙 (최우선 적용)
3. 실패한 테스트를 통과시키기 위한 **최소한의 코드**를 파일로 직접 작성합니다 — 그 이상은 작성하지 않습니다
4. 파일 생성/수정 도구로 구현 코드를 **실제 파일에 작성합니다** (코드 블록만 표시하고 끝내지 않습니다)
5. 작성한 파일 경로를 표시한 후:
   ```
   ✏️ 구현 파일 작성 완료: [정확한 파일 경로]

   전체 테스트를 실행해주세요.
   Type **"green confirmed"** or **"passing"** when all tests pass.
   (Paste error output if tests still fail)
   ```
6. 일시 정지하고 기다립니다
7. 개발자가 오류를 붙여넣으면: 근본 원인을 진단하고, 파일을 직접 수정하고, 다시 일시 정지합니다

### 개발자의 턴인 경우

이 섹션은 **GREEN 담당이 DEV로 선택된 경우에만** 실행합니다.

1. 세션 상태 블록 렌더링 (Phase: GREEN, Phase Owner: DEV)
2. 표시:
   ```
   ## 🟢 GREEN — Your Turn

   Write the minimum code to make the failing test pass.
   No extra features — pass the test only.

   Type **"done"** or **"green confirmed"** when all tests pass.
   (Or type "skip" to have AI implement it instead)
   ```
3. 일시 정지하고 기다립니다

### 최소 구현 원칙

```
// ✅ Minimum — only what the current test needs
async getUser(id: string) {
  return this.repository.findById(id)
}

// ❌ Over-engineering during GREEN
async getUser(id: string) {
  const cached = this.cache.get(id)   // no test for this yet
  if (!cached) throw new Error(...)    // no test for this yet
  return cached
}
```

캐싱, 오류 처리 등은 테스트에서 요구할 때만 추가합니다.

GREEN이 확인되면, 이전 GREEN 요약을 다시 출력하지 말고 짧게 전환한 뒤 REFACTOR로 넘어가기 전에 반드시 다음을 묻습니다:

```
✅ GREEN 확인됨.

Who handles REFACTOR for this cycle?
→ **"me"** — I'll refactor
→ **"you"** — AI proposes and applies refactors
→ **"skip"** — no refactor for this cycle
```

일시 정지하고 기다립니다.

---

## REFACTOR 단계

### AI의 턴인 경우

이 섹션은 **REFACTOR 담당이 AI로 선택된 경우에만** 실행합니다.

1. 세션 상태 블록 렌더링 (Phase: REFACTOR, Phase Owner: AI)
2. **`.agents/coding-conventions.md`를 읽어 리팩토링 기준과 안티패턴을 확인합니다**
3. 테스트와 구현을 다음 사항에 대해 검토합니다:
   - **중복** — 테스트와 구현에 동일한 로직이 있나요?
   - **명명** — 이름이 주석 없이도 의도를 드러내나요?
   - **매직 값** — 명명된 상수로 추출할 수 있나요?
   - **메서드 길이** — 10줄 이상인가요? 추출을 고려하세요.
   - **프레임워크 관용구** — Spring beans, React hooks, pytest fixtures
   - **컨벤션 일관성** — 세션 파일에서 감지된 패턴과 일치하나요?
4. 각 제안에 대해 표시하고 일시 정지합니다:
   ```
   **Refactoring suggestion [N]:** [one-line title]

   Reason: [why this matters]

   Before:
   [code block]

   After:
   [code block]

   Apply this refactor? (yes / no / modify)
   ```
5. 개발자가 **yes**를 입력하면: 파일 수정 도구로 **직접 변경 사항을 적용하고**, 전체 제안을 다시 반복하지 말고 `✅ Refactor applied.`처럼 짧게 표시합니다
6. 개발자가 **modify**를 입력하면: 수정 방향을 받아 반영한 후 직접 적용하고, 다시 필요한 변경점만 표시합니다
7. 리팩토링할 것이 없는 경우: "코드가 깔끔합니다. 이번 사이클에는 리팩토링이 필요하지 않습니다."
8. 모든 제안이 해결된 후:
   ```
   REFACTOR complete. Are all tests still GREEN?
   Type **"green"** to continue to the next test.
   ```
9. 일시 정지하고 기다립니다

### 개발자의 턴인 경우

이 섹션은 **REFACTOR 담당이 DEV로 선택된 경우에만** 실행합니다.

1. 세션 상태 블록 렌더링 (Phase: REFACTOR, Phase Owner: DEV)
2. 표시:
   ```
   ## 🔵 REFACTOR — Your Turn

   Review the implementation and tests for duplication, naming, magic values,
   method length, framework idioms, and convention alignment.

   Refactor only if it improves clarity without changing behavior.
   Run the tests after refactoring.

   Type **"green"** when refactoring is done and tests are still passing.
   (Or type "skip" to leave this cycle without refactoring)
   ```
3. 일시 정지하고 기다립니다

### 건너뛰는 경우

REFACTOR 담당 확인에서 `skip`이 선택되면:
- "이번 사이클은 REFACTOR를 건너뜁니다."를 표시합니다
- 별도 제안이나 파일 수정 없이 다음 단계로 진행합니다

### REFACTOR 중 컨벤션 업데이트

리팩토링을 진행하면서 AI는 기존 컨벤션에 없는 새로운 패턴이 확립되었는지 능동적으로 판단합니다.

**AI가 제안하는 경우** — 다음 중 하나가 감지될 때:
- 이번 태스크에서 처음 쓴 패턴이 재사용할 만한 규칙이 될 가능성이 있음
- 기존 컨벤션에 정의되지 않은 새로운 영역(에러 처리, 특정 어노테이션, 네이밍 등)이 등장함
- 개발자가 특정 방식으로 코드를 수정했고, 그것이 팀 규칙이 될 수 있음

```
💡 새로운 패턴 감지: [패턴 요약 — 1줄]

예시:
  [Before/After 또는 코드 예시]

이 패턴을 코딩 컨벤션에 추가할까요?
→ "yes" — .agents/coding-conventions.md에 추가
→ "no" — 이번만 사용, 컨벤션에는 추가하지 않음
→ "modify [내용]" — 다르게 표현해서 추가
```

일시 정지하고 기다립니다.

**개발자가 직접 요청하는 경우:**
- `add rule [내용]` 입력 시 즉시 `.agents/coding-conventions.md`에 추가
- 컨벤션 파일과 충돌하는 기존 코드가 발견되면 제안: "기존 코드가 현재 컨벤션(`[규칙]`)과 다릅니다. 컨벤션을 업데이트할까요, 아니면 이 코드를 맞출까요?"

**주의:** 매 사이클마다 제안하지 않습니다. 명확히 재사용 가능한 패턴이 확립된 경우에만 제안합니다.

---

## 사이클 완료 → 다음 RED 담당 확인

REFACTOR 후:
- 동일한 태스크에서 다음 테스트를 계속 작성할지 확인합니다
- 계속한다면 다음 RED에 들어가기 전에 다시 묻습니다:
  ```
  ✅ 다음 사이클로 진행합니다.

  Who handles RED for the next cycle?
  → "me"
  → "you"
  ```
- 자동으로 역할을 교체하지 않습니다

---

## 태스크 완료

개발자가 태스크의 테스트가 완료되었음을 알리거나 (더 이상 이 태스크에 대한 테스트가 없는 경우), 또는 양측이 태스크가 완료되었다고 동의하는 경우:

1. `.tdd-sessions/{story-id}.md`를 업데이트합니다:
   - 현재 태스크를 `✅ done`으로 표시합니다

2. **코딩 규칙 업데이트 여부 확인:**

   이번 태스크에서 새롭게 확립된 패턴이나 발견된 규칙이 있을 때만 요약한 뒤 질문합니다.
   패턴이 없으면 이 단계를 길게 출력하지 않고 `✅ Task [N] complete.`만 표시한 뒤 바로 다음 단계로 진행합니다.

   질문이 필요한 경우에만:

   ```
   ✅ Task [N] complete: [task title]

   💡 이번 태스크에서 주목할 패턴:
   - [예: 에러 응답에 ErrorCode enum 사용]
   - [예: Repository 메서드명은 findBy 접두사 사용]
   (패턴이 없으면 이 항목 생략)

   코딩 규칙을 업데이트할까요?
   → "add rule [내용]" — .agents/coding-conventions.md에 규칙 추가
   → "skip" — 규칙 업데이트 없이 다음으로
   ```

   일시 정지하고 기다립니다.
   - `add rule [내용]` 입력 시: `.agents/coding-conventions.md` Custom Rules에 추가 후 다음 단계로
   - `skip` 또는 빈 입력 시: 다음 단계로

3. **커밋 여부 확인:**

   현재 태스크가 끝났으므로, 다음 작업으로 넘어가기 전에 먼저:

   ```text
   /context
   /compact
   /context
   ```

   를 순서대로 실행해 이번 태스크 대화를 압축합니다.

   이후 짧게 표시:

   ```markdown
   📊 Context before compact shown.
   🧹 Task context compacted.
   📊 Context after compact shown.
   ```

   ```
   지금까지 작업한 내용을 커밋할까요?
   → "commit" — /tdd-commit 실행
   → "next" — 커밋 없이 다음 태스크로
   → "done" — 오늘 작업 종료 (나중에 /tdd-commit으로 커밋)
   ```

   일시 정지하고 기다립니다.

   - `commit` 입력 시: `/tdd-commit` 스킬을 실행합니다
   - `next` 입력 시:
     ```
     → 다음 태스크로 이동합니다: Task [N+1] [title]
     ```
   - `done` 입력 시:
     ```
     세션을 종료합니다.
     → Run **/tdd-commit** when you're ready to commit.
     ```

---

## 참조 파일

| 파일 | 읽는 시점 |
|------|-------------|
| `.agents/tech-stack.md` | 세션 시작 시, `update stack` 실행 시, 새 기술 추가 직후 |
| `.agents/coding-conventions.md` | **RED/GREEN/REFACTOR 매 단계마다** — 항상 최신 규칙 적용 |
| `.agents/skills/sync-tech-stack/SKILL.md` | 기술 스택 파일 생성/갱신이 필요할 때 |
| `.agents/skills/tdd-task/references/red-green-refactor-guide.md` | 각 단계 완료 기준 판단 시 |
| `.agents/skills/tdd-task/references/coding-conventions-template.md` | 컨벤션 파일 생성/갱신 시 — 파일 구조 및 생성 규칙 |
