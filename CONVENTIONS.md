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
- 구조: `describe(ComponentName)` + 내부 `test(...)`. 테스트가 많아 상태·기능 단위 구분이 필요하면 `describe("그룹명")` 으로 중첩 그룹핑한다.
  ```tsx
  describe("ComponentName", () => {
    describe("시트가 열리기 전 버튼 상태", () => { ... });
    describe("시트가 열린 후", () => { ... });
    describe("삭제", () => { ... });
  });
  ```
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
- 공유 enum·타입: `src/types/` 에 정의한다. (예: `TodoStatus` enum → `src/types/enums.ts`)
- 접근성: 인터랙티브 요소를 포함하는 리스트 항목은 `<section aria-label="{domain}-{id}">` 로 감싼다 (예: `agent-{id}`, `todo-{id}`)
- Electron 경계: renderer는 Electron 모듈 직접 접근 금지 → preload API로 노출
- 포맷: Biome (double quotes, 2-space indent)

**콜백 인자 검증**
콜백 호출은 인자가 있으면 반드시 `toHaveBeenCalledWith`로 인자까지 검증한다. `toHaveBeenCalledTimes(1)` 단독으로는 인자 변경을 감지하지 못한다.
```ts
// 잘못된 예 — 인자 변경을 감지하지 못한다
expect(onSave).toHaveBeenCalledTimes(1);

// 올바른 예
expect(onSave).toHaveBeenCalledWith("todo-abc-123");
```

**SSE 콜백 캡처 패턴 (`sseHandler` 기반)**
`sseHandler` 유틸을 spy로 교체해 콜백 함수를 캡처한 뒤 테스트에서 직접 호출한다. `EventSource` 전역 교체보다 단순하고 콜백 반환값까지 검증할 수 있다.
```ts
let capturedCallback: (e: MessageEvent) => Promise<boolean>;

beforeEach(() => {
  vi.spyOn(sseHandler, "sseHandler").mockImplementation((_url, _callback) => {
    capturedCallback = _callback;
    return {} as EventSource;
  });
});

// 이벤트 발생: act()로 감싸고, 비동기 결과는 waitFor()로 대기
let callbackResult = false;
await act(async () => {
  callbackResult = await capturedCallback(
    new MessageEvent("message", { data: JSON.stringify({ type: "assigned" }) })
  );
});
await waitFor(() => {
  expect(callbackResult).toEqual(false);
  expect(mockGetTodos).toHaveBeenCalledTimes(3);
});
```
콜백 반환값이 `true`면 SSE 연결 종료, `false`면 유지 (`sseHandler` 계약).

**EventSource 직접 교체 패턴 (필요 시)**
`sseHandler`를 우회해 `EventSource` 자체를 테스트해야 할 때만 사용한다.
```ts
let capturedEventSources: MockEventSource[] = [];

class MockEventSource {
  url: string;
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  close = vi.fn();
  constructor(url: string) {
    this.url = url;
    capturedEventSources.push(this);
  }
}

beforeEach(() => {
  capturedEventSources = [];
  vi.stubGlobal("EventSource", MockEventSource);
});
```

### 안티패턴
| 금지 | 대안 |
|------|------|
| DOM 구조 직접 검사 | role/name 기반 쿼리 |
| renderer에서 Electron 모듈 직접 import | preload API 경유 |
| GREEN 단계에서 IPC까지 한 번에 구현 | 테스트가 요구하는 최소만 구현 |

---

## Backend (Python + FastAPI)

### 테스트

테스트는 역할별로 레이어를 분리한다.

| 레이어 | 파일 위치 | mock 대상 | DB |
|--------|-----------|-----------|-----|
| Router | `src/routers/test_*.py` | Service (`AsyncMock(spec=Service)`) | 없음 |
| Service | `src/services/test_*.py` | Repository, Agent (`AsyncMock(spec=...)`) | 없음 |
| Agent | `src/agents/test_*.py` | LangChain `create_agent` (`@patch`) | 없음 |
| Repository | `src/repositories/test_*.py` | 없음 | in-memory SQLite |
| Publisher | `src/pubs/test_*.py` | asyncio.Queue (실제 Queue 사용) | 없음 |
| Listener | `src/listeners/test_*.py` | Repository, OrchestrationService, SSEManager, async_session_factory | 없음 |
| SSEManager | `src/sse/test_*.py` | 없음 (순수 단위 테스트) | 없음 |
| SSE Router | `src/routers/test_sse_*.py` | SSEManager (`MagicMock(spec=SSEManager)`) | 없음 |
| CORS/앱 설정 | `src/test_cors.py` | Service (ASGITransport, 미들웨어 포함 앱) | 없음 |

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
- **"반환값 검증" 테스트는 반환 객체의 모든 공개 필드를 assert한다.** 스키마에 필드가 추가되면 해당 테스트도 함께 수정한다. 일부 필드만 검증하면 새 필드 누락을 감지하지 못한다.
- **Repository mock 반환값은 반드시 ORM `Entity` 객체로 설정한다.** Pydantic `Response` 객체를 반환하면 Service 내부에서 UUID 변환(`uuid.UUID(result.id)` 등)이 실패한다. Service가 Entity→Response 변환을 담당한다.
- **Service가 내부적으로 `async_session_factory`를 호출하는 경우**, `fake_session_factory`로 패치하고 Repository 클래스는 `return_value=mock`으로 패치한다. 팩토리 함수(`get_task_agent` 등)도 동일하게 패치한다.
```python
@asynccontextmanager
async def fake_session_factory() -> AsyncGenerator[AsyncMock, None]:
    yield AsyncMock()

with (
    patch("services.orchestration_service.get_task_agent", return_value=mock_task_agent),
    patch("services.orchestration_service.async_session_factory", fake_session_factory),
    patch("services.orchestration_service.TodoRepository", return_value=mock_todo_repo),
    patch("services.orchestration_service.AgentRepository", return_value=mock_agent_repo),
):
    sut = OrchestrationService(agent=mock_orchestration_agent)
    result = await sut.select_and_assign(todo_id)
```
```python
@pytest.fixture
def mock_agent_repository() -> AsyncMock:
    return AsyncMock(spec=AgentRepository)

async def test_create_agent_레포지토리_create_함수를_호출한다(mock_agent_repository: AsyncMock) -> None:
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
- arrange: `session.add(Entity(...))` 직접 삽입, assert: DB 직접 조회 또는 반환값만 사용
- True/False 등 결과 분기가 있는 경우 `@pytest.mark.parametrize` 사용
```python
@pytest.mark.parametrize("query_name, expected", [
    ("존재하는 에이전트", True),
    ("없는 에이전트", False),
])
async def test_exists_by_name_에이전트_이름으로_존재여부를_확인할_수_있다(
    setup_test_db: AsyncSession, query_name: str, expected: bool
) -> None:
    session = setup_test_db
    session.add(AgentEntity(id=str(uuid.uuid4()), name="존재하는 에이전트", system_prompt="프롬프트"))
    sut = AgentRepository(session=session)
    result = await sut.exists_by_name(name=query_name)
    assert result is expected
```
- DB 격리: `conftest.py`에 `autouse=True` 픽스처, in-memory SQLite (`sqlite+aiosqlite:///:memory:`)

#### Agent 테스트
- 네이밍: `test_클래스명_한국어설명`
- LangChain `create_agent` 기반 에이전트: `@patch("agents.*.create_agent")`로 교체, `ainvoke` 반환값을 `{"structured_response": ...}` 형태로 설정
```python
@patch("agents.orchestration_agent.create_agent")
async def test_orchestration_agent_에이전트에게_프롬프트를_전달한다(mock_create_agent, mock_agent) -> None:
    mock_create_agent.return_value = mock_agent
    mock_agent.ainvoke.return_value = {
        "structured_response": OrchestrationAgentMessage(result=TargetAgent(...), is_applicable=True, reason="...")
    }
    sut = OrchestrationAgent()
    await sut.ainvoke(user_message)
    mock_agent.ainvoke.assert_called_once_with({"messages": [{"role": "user", "content": user_message}]})
```
- `get_llm()` 직접 사용 에이전트 (`create_agent` 없이 LLM만 래핑): `@patch("agents.*.get_llm")`으로 교체
```python
@patch("agents.task_agent.get_llm")
async def test_task_agent_LLM에게_메시지를_전달한다(mock_get_llm: MagicMock, mock_llm: AsyncMock) -> None:
    mock_get_llm.return_value = mock_llm
    mock_llm.ainvoke.return_value = MagicMock(content="처리 완료")
    sut = TaskAgent()
    await sut.ainvoke(system_prompt="...", user_message="...")
    mock_llm.ainvoke.assert_called_once_with([...])
```

#### Listener 테스트
- 네이밍: `test_함수명_한국어설명`
- 무한 루프 함수는 `asyncio.Queue + queue.join()` 패턴으로 항목 하나 처리 후 `task.cancel()`로 종료
- Listener가 Service에 위임하고 세션/레포를 직접 다루지 않으면, `_run_once`에 패치 없이 `OrchestrationService` + `SSEManager` mock만 주입한다
```python
async def _run_once(
    queue: asyncio.Queue[str],
    orchestration_service: OrchestrationService,
    sse_manager: SSEManager,
) -> None:
    task = asyncio.create_task(run_assignment_listener(queue, orchestration_service, sse_manager))
    await queue.join()
    task.cancel()
    await asyncio.gather(task, return_exceptions=True)
```
- Listener가 세션/레포를 직접 다루는 경우, `async_session_factory`를 `asynccontextmanager`로 패치하고 Repository 클래스는 `return_value=mock`으로 패치한다

#### SSE Router 테스트
- `MagicMock(spec=SSEManager)`로 SSEManager를 교체하고 `subscribe`가 미리 채운 Queue를 반환하도록 설정
- `"completed"` 이벤트가 스트림 종료를 트리거하므로 `await client.get(...)`으로 전체 응답을 수집 가능
- 중간 이벤트("assigned" 등)도 스트리밍됨을 검증하려면 Queue에 순서대로 적재한다
```python
@pytest.fixture
def mock_sse_manager():
    q: asyncio.Queue[dict[str, Any]] = asyncio.Queue()
    q.put_nowait({"type": "assigned", "agent_name": "검색 에이전트"})
    q.put_nowait({"type": "completed", "agent_name": "검색 에이전트"})
    manager = MagicMock(spec=SSEManager)
    manager.subscribe.return_value = q
    return manager
```

### 소스 코드
- 포맷: Ruff (import 정렬)
- 모든 공개 함수에 타입 힌트 필수 (`-> None` 포함)
- 제네릭 타입은 타입 인자를 반드시 명시한다. bare `dict` / `list` / `Queue` 금지.
  - 올바른 예: `dict[str, Any]`, `asyncio.Queue[str]`, `list[AgentEntity]`
  - 잘못된 예: `dict`, `Queue`, `list`
- 비동기 제너레이터 함수는 `AsyncGenerator[YieldType, None]` 반환 타입을 명시한다.
  ```python
  async def event_generator() -> AsyncGenerator[str, None]:
      yield "data: ...\n\n"
  ```
- 테스트 함수도 `-> None` 반환 타입을 명시한다. pytest fixture는 반환 타입을 명시한다.
  ```python
  async def test_something() -> None: ...
  @pytest.fixture
  def mock_service() -> AsyncMock: ...
  @pytest.fixture
  async def client(app: FastAPI) -> AsyncGenerator[AsyncClient, None]:
      async with AsyncClient(...) as c:
          yield c
  ```
- 예외: broad catch 없이 그대로 노출
- import: `src/` 루트 기준 전체 모듈 경로 사용 (`from repositories.database import Base`, `from entities.agent_entities import AgentEntity`)
- SSE 채널 이름은 반드시 `channels/channel_names.py`의 함수로 생성한다. 문자열 리터럴 직접 사용 금지.
  ```python
  # 올바른 예
  from channels.channel_names import TODO_STATUS_CHANNEL
  await sse_manager.publish(TODO_STATUS_CHANNEL(todo_id), {...})
  # 잘못된 예
  await sse_manager.publish(f"todo-{todo_id}", {...})
  ```

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

**`DialogContent` 기본 X 버튼**
`DialogContent`는 기본적으로 우측 상단 X 버튼(`showCloseButton=true`)을 렌더링한다. 명시적 취소 버튼 없이 X 버튼만으로 닫는 다이얼로그에서는 취소 버튼을 추가하지 않는다. X 버튼의 접근 가능한 이름은 `"Close"` (sr-only span)이므로 테스트에서 아래와 같이 쿼리한다.
```tsx
// X 버튼 존재 확인
expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();

// 취소 버튼 미노출 확인
expect(screen.queryByRole("button", { name: "취소" })).not.toBeInTheDocument();

// X 버튼 클릭으로 닫기 확인
await userEvent.click(screen.getByRole("button", { name: "Close" }));
expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
```

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

**폼 라벨**
폼에서 입력 필드에 라벨이 필요하면 `components/ui/label.tsx` (shadcn/ui `Label`)를 사용한다.
`Label`의 `htmlFor`와 입력 요소의 `id`를 짝지어 접근성을 보장한다.
```tsx
<Label htmlFor="agent-name">에이전트 이름</Label>
<Input id="agent-name" ... />
```
테스트에서는 라벨과 연결된 접근 가능한 이름으로 쿼리한다.
```tsx
getByRole("textbox", { name: "에이전트 이름" })
```
`aria-label` 대신 `Label` + `htmlFor`/`id` 조합을 우선한다.

**멀티셀렉트 콤보박스 (`shadcn/ui Combobox`)**
여러 값을 선택하는 드롭다운은 shadcn/ui `Combobox`의 `multiple` 모드를 사용한다. `useComboboxAnchor()`로 앵커를 생성하고 `ComboboxChips`와 `ComboboxContent`에 연결해 드롭다운 위치를 정렬한다.
```tsx
const [selectedTools, setSelectedTools] = useState<string[]>([]);
const anchor = useComboboxAnchor();

<Label htmlFor="agent-tools">도구 리스트</Label>
<Combobox multiple value={selectedTools} onValueChange={(v) => setSelectedTools(v)}>
  <ComboboxChips ref={anchor}>
    {selectedTools.map((tool) => (
      <ComboboxChip key={tool} value={tool}>{tool}</ComboboxChip>
    ))}
    <ComboboxChipsInput id="agent-tools" />
  </ComboboxChips>
  <ComboboxContent anchor={anchor}>
    <ComboboxList>
      {TOOLS.map((tool) => (
        <ComboboxItem key={tool} value={tool}>{tool}</ComboboxItem>
      ))}
    </ComboboxList>
  </ComboboxContent>
</Combobox>
```
다이얼로그가 열릴 때 선택값을 초기화하려면 `useEffect([open])` 안에서 `setSelectedTools([])`를 호출한다.

**shadcn Combobox 테스트 — 팝업 열기**
`userEvent.click(screen.getByRole("combobox"))`는 팝업을 열지 않는다. `@base-ui/react`의 `handleInputPress`가 클릭 대상이 인터랙티브 요소(`input`)일 때 조기 반환하기 때문이다. 팝업을 열려면 `[data-slot="combobox-chips"]` 컨테이너에 `fireEvent.mouseDown`을 사용한다.
```tsx
const comboboxInput = screen.getByRole("combobox");
const chipsContainer = comboboxInput.closest('[data-slot="combobox-chips"]');
expect(chipsContainer).toBeInTheDocument();
fireEvent.mouseDown(chipsContainer as Element);

expect(await screen.findByRole("option", { name: "웹 서치(web search)" })).toBeInTheDocument();
```
`ComboboxContent`는 Portal로 렌더링되므로 `findByRole("option")`은 문서 전체에서 옵션을 찾을 수 있다.
