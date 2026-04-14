# todo-agent

AI 에이전트를 등록·관리하고 태스크를 실행하는 Electron 데스크톱 앱.

---

## References

- 프로젝트 상세 스택 정보: @.agents/tech-stack.md
- 코딩 상세 규칙: @.agents/coding-conventions.md

## Commands

### Frontend

```bash
cd frontend
npm start              # Electron 개발 서버 실행
npm run test           # Vitest (no-watch)
npm run check          # Biome lint + format (--write)
npm run generate:api   # Orval: openapi.yaml → API 클라이언트 재생성
```

### Backend

```bash
cd backend
make run               # uvicorn 127.0.0.1:8000
make test              # pytest -v
make check             # ruff check --fix
make migrate           # alembic upgrade head
make generate-spec     # FastAPI → openapi.yaml 내보내기
```

### Root

```bash
make test-all          # 백엔드 + 프론트엔드 전체 테스트
make format-lint       # 백엔드 + 프론트엔드 전체 lint
```

## Prohibited Actions

- .env 파일은 읽거나 출력하지 않는다.
