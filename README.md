# todo-agent

AI 에이전트를 등록·관리하고 TODO 태스크를 자동으로 실행하는 Electron 데스크톱 앱.

에이전트에게 TODO를 등록하면 LLM 기반 오케스트레이션 에이전트가 적합한 에이전트를 선택하고, 태스크 에이전트가 도구(웹 검색, 브라우저 조작 등)를 활용해 자동으로 실행한다. 실행 상태는 SSE로 실시간 업데이트된다.

---

## 주요 기능

- AI 에이전트 등록·수정·삭제
- TODO 태스크 등록 및 에이전트 자동 배정
- LangChain / LangGraph 기반 태스크 자동 실행
- Playwright 브라우저 조작 도구 지원
- SSE 기반 실시간 실행 상태 스트리밍
- TODO 재할당 흐름 지원

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| **Frontend** | Electron Forge, Vite, React 19, TypeScript, Tailwind CSS v4, shadcn/ui |
| **Backend** | FastAPI, SQLAlchemy (async), Alembic, uvicorn |
| **AI** | LangChain, LangGraph, langchain-aws (AWS Bedrock) |
| **테스트** | Vitest (frontend), pytest + pytest-asyncio (backend) |
| **코드 품질** | Biome (frontend), Ruff + mypy (backend) |

---

## 프로젝트 구조

```
todo-agent/
├── frontend/               # Electron + React 렌더러
│   ├── src/
│   │   ├── main.ts         # Electron main process
│   │   ├── preload.ts      # preload bridge
│   │   ├── main.tsx        # React 진입점
│   │   ├── App.tsx         # 라우터 + Provider
│   │   ├── windows/        # 페이지 단위 최상위 컴포넌트
│   │   ├── components/     # 기능 UI 컴포넌트
│   │   ├── repository/     # API 클라이언트 래퍼
│   │   ├── api/generated/  # Orval 자동생성 (수정 금지)
│   │   ├── types/          # 공유 enum·타입
│   │   └── utils/          # SSE 핸들러 등 유틸
│   └── package.json
│
├── backend/                # FastAPI 서버
│   ├── src/
│   │   ├── app.py          # FastAPI 앱, 라우터, lifespan
│   │   ├── routers/        # HTTP / SSE 엔드포인트
│   │   ├── services/       # 비즈니스 로직
│   │   ├── repositories/   # SQLAlchemy DB 접근
│   │   ├── entities/       # ORM 엔티티
│   │   ├── schemas/        # Pydantic 요청/응답 스키마
│   │   ├── agents/         # OrchestrationAgent, TaskAgent
│   │   ├── tools/          # ToolFactory, Playwright 툴킷
│   │   ├── listeners/      # 백그라운드 assignment 리스너
│   │   ├── channels/       # asyncio.Queue 싱글톤
│   │   └── sse/            # SSE 구독 매니저
│   ├── alembic/            # DB 마이그레이션
│   ├── requirements.txt
│   └── Makefile
│
├── spec/
│   └── openapi.yaml        # FastAPI 자동생성 API 명세 (수정 금지)
│
└── Makefile                # 루트 공통 커맨드
```

---

## 개발 환경 구축

### 사전 요구 사항

- Python 3.11 이상
- Node.js 20 이상
- AWS 계정 (Bedrock 모델 접근 권한)
- Playwright 브라우저 (설치 방법은 아래 참고)

### 1. 백엔드 설정

```bash
cd backend

# 가상환경 생성 및 의존성 설치
python -m venv .venv
.venv/bin/pip install -r requirements.txt

# Playwright 브라우저 설치
.venv/bin/playwright install chromium

# 환경변수 설정
cp .env.template .env
# .env 파일에 AWS 자격증명 입력
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...

# DB 마이그레이션 실행
make migrate
```

### 2. 프론트엔드 설정

```bash
cd frontend

# 의존성 설치
npm install
```

---

## 애플리케이션 실행

백엔드와 프론트엔드를 **별도 터미널**에서 각각 실행한다.

```bash
# 터미널 1 — FastAPI 백엔드 (127.0.0.1:8000)
make start-backend

# 터미널 2 — Electron 앱
make start-frontend
```

---

## 개발 명령어

```bash
# 포맷·린트 (backend Ruff + frontend Biome)
make format-lint

# 타입 체크 (커밋 전 필수)
make typecheck-frontend

# 전체 테스트
make test-all

# 백엔드 테스트만
cd backend && .venv/bin/pytest -v

# 프론트엔드 테스트만
cd frontend && npm run test

# 특정 테스트 실행
cd backend && .venv/bin/pytest src/services/test_agent_service.py -v
cd frontend && npm run test -- -t "에이전트 등록"
```

---

## API 스펙 변경 워크플로우

백엔드 엔드포인트 추가·변경 후 프론트엔드 클라이언트를 재생성한다.

```bash
cd backend && make generate-spec      # FastAPI → spec/openapi.yaml
cd frontend && npm run generate:api   # openapi.yaml → src/api/generated/
```

`spec/openapi.yaml`과 `frontend/src/api/generated/`는 자동생성 파일이므로 직접 수정하지 않는다.

---

## DB 마이그레이션

`backend/src/entities/`에 엔티티를 추가·변경한 경우 반드시 마이그레이션을 생성하고 적용한다.

```bash
cd backend

# 마이그레이션 파일 자동생성
.venv/bin/alembic revision --autogenerate -m "설명"

# 마이그레이션 적용
make migrate
```
