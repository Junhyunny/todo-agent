---
name: sync-architecture
description: >
  Use this skill when the user says "sync architecture", "update architecture",
  "아키텍처 동기화", "아키텍처 업데이트", "구조 정리", "ARCHITECTURE.md 만들어줘",
  or wants to generate/refresh a structural overview of the project for AI agents.
  Analyzes project structure, data flow, layer architecture, and boundaries,
  then writes ARCHITECTURE.md at the project root.
---

# Sync Architecture

## Invocation

```
/sync-architecture
```

인수가 없어도 된다. 실행할 때마다 현재 프로젝트를 분석해 `ARCHITECTURE.md`를 생성 또는 갱신한다.

---

## 목적

AI 에이전트가 코드를 작성할 때 가장 많은 토큰을 소비하는 원인은 **탐색·추측·되돌아오기**다.
이 스킬은 에이전트가 탐색 없이 바로 작업에 들어갈 수 있도록 다음을 제공한다:

- **구조 (Structure):** 파일과 폴더가 어디에 있는지 — 에이전트가 탐색을 시작하지 않아도 된다
- **흐름 (Flow):** 데이터·요청이 어떤 경로로 이동하는지 — 에이전트가 잘못된 파일을 수정하지 않는다
- **경계 (Boundary):** 수정해도 되는 곳과 금지된 곳 — 에이전트가 경계를 넘는 실수를 사전에 차단한다

---

## 전체 흐름

```
Step 1: 기존 파일 확인
     ↓
Step 2: 프로젝트 분석
     ↓
Step 3: ARCHITECTURE.md 작성 또는 갱신
     ↓
Step 4: 결과 표시
```

---

## Step 1: 기존 파일 확인

프로젝트 루트의 `ARCHITECTURE.md` 존재 여부를 확인한다.

- 파일이 있으면 현재 내용을 읽고 기존 구조와 `## Notes` 섹션을 확인한다
- 파일이 없으면 새로 생성할 준비를 한다

---

## Step 2: 프로젝트 분석

감지 규칙은 `references/stack-detection.md`를 따른다.
파일 형식은 `references/architecture-file-format.md`를 참고한다.

다음 4가지를 분석한다.

### 2-1. 스택 및 디렉터리 구조

- 빌드/패키지 파일 (`package.json`, `pyproject.toml`, `build.gradle.kts` 등)로 스택 영역을 감지한다
- 모노레포면 영역별로 분리한다
- 각 영역의 **주요 경로와 역할**을 2~3 depth로 수집한다
  - 진입점(entry point) 명시
  - 수정 금지 폴더(`api/generated/`, `components/ui/` 등)는 명시적으로 표시
- 불필요한 파일 목록(빌드 산출물, `node_modules` 등)은 포함하지 않는다

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

수정하면 안 되는 파일/폴더와 그 이유, 대안을 표로 정리한다:

| 경계 | 이유 | 대안 |
|------|------|------|
| `api/generated/` 직접 수정 | orval 자동생성 | `openapi.yaml` 수정 후 재생성 |
| `components/ui/` 수정 | shadcn/ui 관리 | shadcn 명령어로 재설치 또는 래핑 |

### 모호한 경우

스택 감지 결과가 불확실하거나 구조 파악이 어려우면 바로 질문한다:

```
프로젝트 구조 중 확인이 필요한 부분이 있습니다:
- [질문 내용]

어떻게 처리할까요?
```

PAUSE. 확인 후 계속한다.

---

## Step 3: `ARCHITECTURE.md` 작성 또는 갱신

- 파일 형식은 `references/architecture-file-format.md`를 따른다
- 기존 파일이 있으면 분석 결과를 기준으로 내용을 갱신한다
- 기존 `## Notes` 섹션이 있으면 유지한다
- **간결하게 유지한다.** 에이전트가 탐색 없이 파악할 수 있는 수준이면 충분하다
- 장황한 배경 설명·히스토리·TBD 항목은 포함하지 않는다

---

## Step 4: 결과 표시

완료 후 짧게 표시한다:

```markdown
✅ 아키텍처 동기화 완료 → ARCHITECTURE.md

감지된 영역:
- [영역명] [스택] ([경로])

변경 사항:
- [새로 추가/갱신된 항목]
```

변경 사항이 없으면:

```markdown
✅ ARCHITECTURE.md가 이미 최신입니다.
```

---

## 참조 파일

| 파일 | 사용 시점 |
|------|---------|
| `references/stack-detection.md` | Step 2 스택 감지 시 |
| `references/architecture-file-format.md` | Step 3 파일 작성/갱신 시 |

