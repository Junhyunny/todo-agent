---
name: sync-architecture
description: >
  Use this skill when the user says "sync architecture", "update architecture",
  "아키텍처 동기화", "아키텍처 업데이트", "구조 정리", "ARCHITECTURE.md 만들어줘",
  or wants to generate/refresh a structural overview of the project for AI agents.
  Analyzes project structure per area and writes ARCHITECTURE-{AREA}.md files
  (or ARCHITECTURE.md for single-area projects) at the project root.
---

# Sync Architecture

## Invocation

```
/sync-architecture
```

인수가 없어도 된다. 실행할 때마다 현재 프로젝트를 분석해 영역별 아키텍처 파일을 생성 또는 갱신한다.

**파일 명명 규칙:**
- 다중 영역: `ARCHITECTURE-{AREA}.md` (예: `ARCHITECTURE-FRONTEND.md`, `ARCHITECTURE-LAMBDA.md`)
- 단일 영역 (루트에 빌드 파일이 바로 있는 경우): `ARCHITECTURE.md`

---

## 목적

AI 에이전트가 코드를 작성할 때 가장 많은 토큰을 소비하는 원인은 **탐색·추측·되돌아오기**다.
이 스킬은 에이전트가 탐색 없이 바로 작업에 들어갈 수 있도록 다음을 제공한다:

- **구조 (Structure):** 파일과 폴더가 어디에 있는지
- **흐름 (Flow):** 데이터·요청이 어떤 경로로 이동하는지
- **경계 (Boundary):** 수정해도 되는 곳과 금지된 곳

---

## 전체 흐름

```
Step 1: 기존 파일 확인
     ↓
Step 2: 영역 감지 및 분석
     ↓
Step 3: ARCHITECTURE-{AREA}.md 작성 또는 갱신
     ↓
Step 4: 파일 압축 검토
     ↓
Step 5: 결과 표시
```

---

## Step 1: 기존 파일 확인

프로젝트 루트에서 다음 파일들을 확인한다:

- `ARCHITECTURE-*.md` 패턴의 파일 목록
- 레거시 `ARCHITECTURE.md`

파일이 있으면 각 파일의 내용을 읽고 기존 구조와 `## Notes` 섹션을 확인한다.

---

## Step 2: 영역 감지 및 분석

감지 규칙은 `references/stack-detection.md`를 따른다.
파일 형식은 `references/architecture-file-format.md`를 참고한다.

### 2-0. 영역(Area) 감지

루트 디렉터리를 스캔해 독립적인 프로젝트 영역을 식별한다.

**영역으로 간주하는 기준 (하나 이상 충족):**
- 해당 디렉터리에 빌드/패키지 파일(`package.json`, `pyproject.toml`, `build.gradle.kts` 등)이 있다
- 명확히 분리된 관심사를 가진 루트 디렉터리다 (`frontend/`, `backend/`, `lambda/`, `api/` 등)

**파일 이름 결정:**
- 영역이 2개 이상 → `ARCHITECTURE-{DIRNAME_UPPERCASE}.md` (예: `frontend/` → `ARCHITECTURE-FRONTEND.md`)
- 영역이 1개 또는 루트에만 빌드 파일이 있는 경우 → `ARCHITECTURE.md`

### 2-1. 스택 및 디렉터리 구조

각 영역에 대해:

- 빌드/패키지 파일로 스택을 감지한다
- **주요 경로와 역할**을 2~3 depth로 수집한다
  - 진입점(entry point) 명시
  - 수정 금지 폴더는 명시적으로 표시
- 빌드 산출물, `node_modules` 등은 포함하지 않는다

### 2-2. 데이터 흐름

각 영역에서 데이터·요청이 이동하는 핵심 경로를 파악한다:

- 프로세스 간 통신 방식 (HTTP, IPC, gRPC 등)
- 레이어 간 호출 순서 (Router → Service → Repository 등)
- 자동 생성 파이프라인 (예: openapi.yaml → orval → generated 클라이언트)

화살표(`→`)로 단방향 흐름을 표현하고 **수정 금지 파일**은 `[수정 금지]`로 표시한다.

### 2-3. 레이어 아키텍처

각 레이어의 역할과 의존 방향을 정리한다:

- 레이어 이름과 역할 한 줄 요약
- 레이어 간 의존 규칙 (예: "Service는 Repository를 호출하고, Repository는 Service를 참조하지 않는다")

### 2-4. 경계 (Boundary)

수정하면 안 되는 파일/폴더와 그 이유, 대안을 표로 정리한다.

### 모호한 경우

영역 구분이 불확실하거나 구조 파악이 어려우면 바로 질문한다:

```
프로젝트 구조 중 확인이 필요한 부분이 있습니다:
- [질문 내용]

어떻게 처리할까요?
```

PAUSE. 확인 후 계속한다.

---

## Step 3: `ARCHITECTURE-{AREA}.md` 작성 또는 갱신

- 파일 형식은 `references/architecture-file-format.md`를 따른다
- 영역별로 각각의 파일을 작성 또는 갱신한다
- 기존 파일이 있으면 분석 결과를 기준으로 내용을 갱신한다
- 기존 `## Notes` 섹션이 있으면 유지한다
- **간결하게 유지한다.** 에이전트가 탐색 없이 파악할 수 있는 수준이면 충분하다
- 장황한 배경 설명·히스토리·TBD 항목은 포함하지 않는다

---

## Step 4: 파일 압축 검토

작성 또는 갱신된 각 파일을 다음 기준으로 검토하고 압축한다.

1. **이모지·아이콘 제거** — 파일 본문에 포함된 이모지(✅, 💡, ⚠️ 등)는 모두 제거한다
2. **중복 표현 통합** — 동일한 내용이 여러 섹션에 반복되면 한 곳에만 남기고 나머지는 삭제한다
3. **자명한 설명 제거** — 디렉터리 이름·파일 이름만 봐도 알 수 있는 주석은 생략한다
4. **빈 섹션 제거** — 내용이 없는 섹션은 제목까지 삭제한다
5. **과도한 세부 사항 축약** — 에이전트가 작업에 필요한 수준을 넘는 설명은 한 줄로 줄이거나 삭제한다

---

## Step 5: 결과 표시

완료 후 짧게 표시한다:

```markdown
아키텍처 동기화 완료

생성/갱신된 파일:
- ARCHITECTURE-FRONTEND.md — [변경 사항]
- ARCHITECTURE-LAMBDA.md — [변경 사항]
```

변경 사항이 없으면:

```markdown
아키텍처 파일이 이미 최신입니다.
```

---

## 참조 파일

| 파일 | 사용 시점 |
|------|---------|
| `references/stack-detection.md` | Step 2 영역·스택 감지 시 |
| `references/architecture-file-format.md` | Step 3 파일 작성/갱신 시 |
