# 코딩 컨벤션

## Frontend (TypeScript + React)

### 테스트
- 파일 위치: 컴포넌트 옆 co-located `*.test.tsx`
- 구조: `describe(ComponentName)` + 내부 `test(...)`
- 쿼리: role 기반 (`getByRole`, `findByRole`)
- 테스트명: 한국어 문장형

**Mock — `vi.hoisted` 패턴**
`vi.mock`은 호이스팅되므로 블록 바깥 변수를 참조할 수 없다. 반드시 `vi.hoisted`로 감싼다.
```ts
const mockCreateAgent = vi.hoisted(() => vi.fn());
vi.mock("../repository/agents", () => ({ createAgent: mockCreateAgent }));

beforeEach(() => { mockCreateAgent.mockClear(); });
```

**Assertion — 리스트 항목 스코핑**
같은 role이 여러 개일 때 `within()`으로 스코핑한다.
```ts
const item = await within(screen).findByLabelText("agent-1");
expect(within(item).getByRole("button", { name: "삭제" })).toBeInTheDocument();
```
비동기 진입은 `findBy*`, 이후 동기 검증은 `getBy*`.

트리거 버튼과 다이얼로그 내부 버튼의 이름이 같을 때도 `within(dialog)`로 스코핑한다.
```ts
await userEvent.click(screen.getByRole("button", { name: "삭제" })); // 트리거
await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "삭제" })); // 확인
```

### 소스 코드
- 컴포넌트: 함수형 + named export
- 접근성: 인터랙티브 요소를 포함하는 리스트 항목은 `<section aria-label="agent-{id}">` 로 감싼다
- Electron 경계: renderer는 Electron 모듈 직접 접근 금지 → preload API로 노출
- 포맷: Biome (double quotes, 2-space indent)

### 안티패턴
| 금지 | 대안 |
|------|------|
| DOM 구조 직접 검사 | role/name 기반 쿼리 |
| renderer에서 Electron 모듈 직접 import | preload API 경유 |
| GREEN 단계에서 IPC까지 한 번에 구현 | 테스트가 요구하는 최소만 구현 |

---

## Backend (Python + FastAPI)

### 테스트
- 파일 위치: `backend/src/` co-located `test_*.py`
- 구조: pytest 함수 기반, `test_METHOD_resource_한국어설명` 네이밍
  - 예: `test_DELETE_agents_에이전트를_삭제하고_204를_반환한다`, `test_PUT_agents_DB에_에이전트가_수정된다`
- DB 격리: `conftest.py`에 `autouse=True` 픽스처, in-memory SQLite (`sqlite+aiosqlite:///:memory:`)
```python
app.dependency_overrides[get_session] = lambda: test_session
# teardown: app.dependency_overrides.clear() + engine.dispose()
 ```
- 셋업/검증 독립성: arrange는 DB 직접 삽입, assert는 DB 직접 조회 또는 응답만 사용. 다른 API 엔드포인트 경유 금지

### 소스 코드
- 포맷: Ruff (import 정렬)
- 모든 공개 함수에 타입 힌트 필수
- 예외: broad catch 없이 그대로 노출
- import: `src/` 루트 기준 전체 모듈 경로 사용 (`from repositories.database import Base`, `from models.agent_models import AgentModel`)

---

## Frontend Repository 패턴
API 호출은 `frontend/src/repository/` 도메인별 파일에서 함수로 노출한다.
```ts
// src/repository/agents.ts
export const createAgent = async (payload: CreateAgentRequest): Promise<Agent> => { ... }
```
클래스/객체 래핑 금지, named export만 사용.

**Repository 테스트 mock 완전성**
`getFastAPI()` mock에는 테스트 대상 함수와 무관하게 전체 반환 함수를 포함한다. 누락 시 다른 테스트/import에서 오류가 발생한다.
```ts
vi.mock("../api/generated/agents", () => ({
  getFastAPI: () => ({
    getAgentsApiAgentsGet: mockGetAgentsApiAgentsGet,
    createAgentApiAgentsPost: mockCreateAgentApiAgentsPost,
    updateAgentApiAgentsAgentIdPut: mockUpdateAgentApiAgentsAgentIdPut,
    deleteAgentApiAgentsAgentIdDelete: mockDeleteAgentApiAgentsAgentIdDelete,
  }),
}));
```

**다이얼로그 타이틀 구조** _(업데이트: 2026-04-17)_
모든 다이얼로그는 `DialogHeader` + `DialogTitle`로 타이틀을 노출한다.
```tsx
<DialogContent>
  <DialogHeader>
    <DialogTitle>에이전트 등록</DialogTitle>
  </DialogHeader>
  ...
</DialogContent>
```
테스트에서는 `getByRole("heading", { name: "..." })`으로 검증한다.

**`DialogClose` 조건부 비활성화 패턴** _(업데이트: 2026-04-17)_
저장 버튼을 조건부로 비활성화할 때는 `DialogClose`에 직접 `disabled`를 주지 않고 `render` prop의 `Button`에 전달한다.
disabled 상태의 HTML 버튼은 클릭 이벤트가 발생하지 않으므로 다이얼로그도 닫히지 않는다.
```tsx
<DialogClose
  render={<Button disabled={!name || !systemPrompt} />}
  onClick={() => void handleSave()}
>
  저장
</DialogClose>
```

**다이얼로그 비동기 닫기 패턴**
비동기 작업 완료 후 다이얼로그를 프로그래매틱하게 닫아야 할 때는 `useState`로 open 상태를 직접 관리한다.
```tsx
const [open, setOpen] = useState(false);

const handleAction = () => {
  someAsyncCall().then(() => {
    setOpen(false);
    onCallback();
  });
};

return <Dialog open={open} onOpenChange={setOpen}>...</Dialog>;
```

**다이얼로그 폼 상태 초기화 패턴**
다이얼로그가 열릴 때 폼 입력값을 초기화(또는 원래 값으로 복구)해야 할 때는 `useEffect`로 `open` 상태를 의존성으로 사용한다.
```tsx
const [open, setOpen] = useState(false);
const [name, setName] = useState("");

useEffect(() => {
  if (open) {
    setName(""); // 등록 폼: 빈 값으로 초기화
    // 수정 폼: setName(entity.name) 처럼 원래 값으로 복구
  }
}, [open]);
```
취소/저장 후 재오픈 시 이전 입력값이 남지 않도록 보장한다.
