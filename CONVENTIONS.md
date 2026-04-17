# 코딩 컨벤션

<!--
작성 원칙:
- 비직관적이거나 팀/프로젝트 고유한 패턴만 기술한다.
- 프레임워크 기본 동작과 동일한 내용은 생략한다.
- 패턴이 없는 항목은 줄 자체를 추가하지 않는다.
- 코드 예시는 "왜 이렇게 해야 하는가"가 글로 설명하기 어려울 때만 포함한다.
- 타임스탬프, 출처 주석, [기본값] 레이블은 포함하지 않는다.
-->

## Frontend (TypeScript + React)

### 테스트
- 파일 위치: 컴포넌트 옆 co-located `*.test.tsx`
- 구조: `describe(ComponentName)` + 내부 `test(...)`
- 쿼리: role 기반 (`getByRole`, `findByRole`)
- 테스트명: 한국어 문장형
- React import: 테스트 파일 최상단에 `// biome-ignore lint/correctness/noUnusedImports: need for proper rendering` 주석과 함께 추가 (`.test.tsx`만 해당)

**Mock — `vi.hoisted` 패턴**
`vi.mock`은 호이스팅되므로 블록 바깥 변수를 참조할 수 없다. 반드시 `vi.hoisted`로 감싼다.
```ts
const mockCreateAgent = vi.hoisted(() => vi.fn());
vi.mock("../repository/agent-repository", () => ({ createAgent: mockCreateAgent }));

beforeEach(() => { mockCreateAgent.mockClear(); });
```

**Assertion — 리스트 항목 스코핑**
같은 role이 여러 개일 때 `within()`으로 스코핑한다.
```ts
const dialog = screen.getByRole("dialog");
const item = await within(dialog).findByLabelText("agent-1");
expect(within(item).getByRole("button", { name: "삭제" })).toBeInTheDocument();
```
비동기 진입은 `findBy*`, 이후 동기 검증은 `getBy*`.

트리거 버튼과 다이얼로그 내부 버튼의 이름이 같을 때도 `within(dialog)`로 스코핑한다.
```ts
await userEvent.click(within(agentItem).getByRole("button", { name: "삭제" })); // 트리거
await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "삭제" })); // 확인
```

### 소스 코드
- 컴포넌트: 함수형 + named export
- 접근성: 인터랙티브 요소를 포함하는 리스트 항목은 `<section aria-label="{domain}-{id}">` 로 감싼다 (예: `agent-{id}`, `todo-{id}`)
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

테스트는 Router / Service / Repository 3개 레이어로 분리한다.

| 레이어 | 파일 위치 | mock 대상 | DB |
|--------|-----------|-----------|-----|
| Router | `src/routers/test_*.py` | Service (`AsyncMock(spec=Service)`) | 없음 |
| Service | `src/services/test_*.py` | Repository (`AsyncMock(spec=Repository)`) | 없음 |
| Repository | `src/repositories/test_*.py` | 없음 | in-memory SQLite |

#### 공통
- 구조: pytest 함수 기반, 테스트명 한국어 문장형
- `sut` 변수명으로 테스트 대상 인스턴스 생성

#### Router 테스트
- 네이밍: `test_HTTP메서드_resource_한국어설명`
  - 예: `test_DELETE_agents_에이전트를_삭제하고_204를_반환한다`
- `AsyncMock(spec=AgentService)` fixture → `app.dependency_overrides[Service] = lambda: mock`
- 응답 상태코드와 body만 검증

#### Service 테스트
- 네이밍: `test_메서드명_한국어설명`
  - 예: `test_create_agent_레포지토리_create_함수를_호출한다`
- `AsyncMock(spec=AgentRepository)` fixture
- 테스트 쌍으로 작성: "레포지토리 호출 검증" + "반환값 검증"
- **Repository mock 반환값은 반드시 ORM `Model` 객체로 설정한다.** Pydantic `Response` 객체를 반환하면 Service 내부에서 UUID 변환(`uuid.UUID(result.id)` 등)이 실패한다. Service가 Model→Response 변환을 담당한다.
```python
@pytest.fixture
def mock_agent_repository():
    return AsyncMock(spec=AgentRepository)

async def test_create_agent_레포지토리_create_함수를_호출한다(mock_agent_repository):
    sut = AgentService(agent_repository=mock_agent_repository)
    await sut.create_agent(request=AgentRequest(...))
    mock_agent_repository.create.assert_called_once()
    _, kwargs = mock_agent_repository.create.call_args
    assert kwargs["model"].name == "..."
```

#### Repository 테스트
- 네이밍: `test_메서드명_한국어설명`
  - 예: `test_create_에이전트_정보를_저장할_수_있다`
- `setup_test_db: AsyncSession` 픽스처로 세션 수령 (conftest `autouse=True`)
- arrange: `session.add(Model(...))` 직접 삽입, assert: DB 직접 조회 또는 반환값만 사용
- True/False 등 결과 분기가 있는 경우 `@pytest.mark.parametrize` 사용
```python
@pytest.mark.parametrize("query_name, expected", [
    ("존재하는 에이전트", True),
    ("없는 에이전트", False),
])
async def test_exists_by_name_에이전트_이름으로_존재여부를_확인할_수_있다(
    setup_test_db: AsyncSession, query_name: str, expected: bool
):
    session = setup_test_db
    session.add(AgentModel(id=str(uuid.uuid4()), name="존재하는 에이전트", system_prompt="프롬프트"))
    sut = AgentRepository(session=session)
    result = await sut.exists_by_name(name=query_name)
    assert result is expected
```
- DB 격리: `conftest.py`에 `autouse=True` 픽스처, in-memory SQLite (`sqlite+aiosqlite:///:memory:`)

### 소스 코드
- 포맷: Ruff (import 정렬)
- 모든 공개 함수에 타입 힌트 필수
- 예외: broad catch 없이 그대로 노출
- import: `src/` 루트 기준 전체 모듈 경로 사용 (`from repositories.database import Base`, `from models.agent_models import AgentModel`)

---

## Frontend Repository 패턴

API 호출은 `frontend/src/repository/` 에 `{domain}-repository.ts` 파일로 분리한다.

**구현 — 모듈 레벨 destructuring**
`getFastAPI()`를 모듈 레벨에서 한 번만 호출해 destructuring한다.
```ts
// src/repository/agent-repository.ts
const {
  getAgentsApiAgentsGet,
  createAgentApiAgentsPost,
  existsAgentApiAgentsExistsGet,
  updateAgentApiAgentsAgentIdPut,
  deleteAgentApiAgentsAgentIdDelete,
} = getFastAPI();

export const createAgent = async (request: PostAgentRequest): Promise<AgentResponse> => {
  const response = await createAgentApiAgentsPost(request);
  return response.data;
};
```
클래스/객체 래핑 금지, named export만 사용.

**Repository 테스트 mock 완전성**
`getFastAPI()` mock에는 테스트 대상 함수와 무관하게 모듈에서 destructuring하는 **전체** 함수를 포함한다. 누락 시 다른 테스트/import에서 오류가 발생한다.
```ts
vi.mock("../api/generated/agents", () => ({
  getFastAPI: () => ({
    getAgentsApiAgentsGet: mockGetAgentsApiAgentsGet,
    createAgentApiAgentsPost: mockCreateAgentApiAgentsPost,
    existsAgentApiAgentsExistsGet: mockExistsAgentApiAgentsExistsGet,
    updateAgentApiAgentsAgentIdPut: mockUpdateAgentApiAgentsAgentIdPut,
    deleteAgentApiAgentsAgentIdDelete: mockDeleteAgentApiAgentsAgentIdDelete,
  }),
}));
```

---

## 다이얼로그 패턴

**타이틀 구조**
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

**`DialogClose` 조건부 비활성화**
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

**비동기 닫기**
비동기 작업 완료 후 다이얼로그를 프로그래매틱하게 닫을 때는 `useState`로 open 상태를 직접 관리한다.
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

**폼 상태 초기화**
다이얼로그가 열릴 때 폼 입력값을 초기화(또는 원래 값으로 복구)할 때는 `useEffect`로 `open`을 의존성으로 사용한다.
```tsx
useEffect(() => {
  if (open) {
    setName(""); // 등록 폼: 빈 값으로 초기화
    // 수정 폼: setName(entity.name) 처럼 원래 값으로 복구
  }
}, [open]);
```
취소/저장 후 재오픈 시 이전 입력값이 남지 않도록 보장한다.
