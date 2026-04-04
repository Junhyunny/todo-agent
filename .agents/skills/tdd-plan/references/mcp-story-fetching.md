# MCP 스토리 페칭 가이드

이 참고 문서는 MCP 도구를 통해 TrackerBoot에서 스토리를 페치하는 방법을 설명합니다.

스토리 입력은 두 가지 모드를 지원합니다:
1. **TrackerBoot 스토리 ID** — MCP를 통해 페치
2. **붙여넣은 스토리 내용** — 직접 사용, MCP 불필요

둘 다 제공되지 않으면 세션이 시작되지 않습니다.

---

## 검색 전략

특정 MCP 도구 이름을 하드코딩하지 마십시오. 대신:

1. 현재 세션에서 사용 가능한 도구 목록을 검토합니다
2. TrackerBoot 패턴과 일치하는 도구를 찾습니다
3. 찾지 못하면 오류를 보고하고 중단합니다

---

## TrackerBoot MCP 패턴

### 도구 이름

```
tracker-boot-mcp-tb_get_story
```

### 호출 방법

`storyId`를 전달합니다.

```json
{
  "storyId": 12345678
}
```

전송 전 선행 `#`이 있으면 제거합니다 (`#12345678` → `12345678`).

### 응답 필드 추출

| 대상 필드 | TrackerBoot 필드 | 비고 |
|-------------|------------------|-------|
| 제목 | `name` | 항상 존재 |
| 설명 | `description` | 일반 텍스트 |
| 상태 | `current_state` | `unstarted`, `started`, `finished` 등 |
| 스토리 타입 | `story_type` | `feature`, `bug`, `chore` |
| 추정치 | `estimate` | 스토리 포인트 — 선택적 |
| 레이블 | `labels[].name` | 태그 — 선택적 |
| 인수 조건 | `tasks[]` 또는 `description`에 포함 | 둘 다 확인 |

### TrackerBoot Tasks와 인수 조건

TrackerBoot는 체크리스트 항목을 위한 `tasks` 배열을 가집니다. 존재하는 경우 이를 인수 조건으로 사용합니다:

```json
{
  "tasks": [
    { "description": "User can update name", "complete": false },
    { "description": "User can update email", "complete": false }
  ]
}
```

`tasks`가 비어 있거나 없는 경우, `description` 필드에서 "Acceptance Criteria:" 또는 "AC:" 섹션을 파싱합니다.

---

## 실패 처리

### MCP 도구를 찾을 수 없는 경우

```
"Could not find a TrackerBoot MCP tool in the current session.

Please check that the TrackerBoot MCP server is configured, then try again,
or paste the story content directly."
```

**STOP — Phase 2로 진행하지 마십시오.**

### MCP 호출이 오류를 반환한 경우

```
"Could not fetch story [ID] from TrackerBoot: [error message].

Please verify the story ID and TrackerBoot configuration, then try again,
or paste the story content directly."
```

**STOP — Phase 2로 진행하지 마십시오.**

### 묵시적 실패 금지

항상 페치 실패 이유를 설명합니다. 스토리 내용을 추측하거나 만들어내지 마십시오.

---

## 파싱된 스토리 표시 형식

성공적으로 페치한 후, 스토리를 표시하고 확인을 위해 PAUSE합니다:

```markdown
## Story

**ID:** 12345678
**Title:** User Profile Update

**Description:**
A logged-in user should be able to update their name and email address.
Changes take effect immediately, and a success message is shown on save.

**Acceptance Criteria:**
- [ ] User can update their name
- [ ] User can update their email
- [ ] An error message is shown when the email format is invalid
- [ ] A confirmation message "Profile updated successfully" is shown on save

**Status:** started

---
Does this look correct? Type "ok" to continue, or let me know what to fix.
```

---

## 스토리 ID 형식 인식

다음을 TrackerBoot 스토리 ID로 인식합니다 (MCP 페치 실행):
- `12345678` — 숫자 ID
- `#12345678` — 해시 접두사가 붙은 숫자 ID

다음을 직접 스토리 내용으로 인식합니다 (Phase 1 건너뛰고, 파싱하여 직접 표시):
- 긴 텍스트 단락
- "As a user..." 사용자 스토리 형식
- 인수 조건이 나열된 여러 줄의 텍스트

그 외의 것 (예: `PROJ-123`과 같은 짧은 영숫자 코드)은 지원되는 형식이 아닙니다 — 오류를 표시하고 중단합니다.
