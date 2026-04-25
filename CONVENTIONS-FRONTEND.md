# 코딩 컨벤션 — Frontend

<!--
작성 원칙:
- 비직관적이거나 팀/프로젝트 고유한 패턴만 기술한다.
- 프레임워크 기본 동작과 동일한 내용은 생략한다.
- 패턴이 없는 항목은 줄 자체를 추가하지 않는다.
- 코드 예시는 "왜 이렇게 해야 하는가"가 글로 설명하기 어려울 때만 포함한다.
- 타임스탬프, 출처 주석, [기본값] 레이블은 포함하지 않는다.
-->

## 테스트

- 파일 위치: 컴포넌트 옆 co-located `*.test.tsx`
- 구조: `describe(ComponentName)` + 내부 `test(...)`. 상태·기능 단위 구분이 필요하면 `describe("그룹명")`으로 중첩 그룹핑한다.
- 쿼리: role 기반 (`getByRole`, `findByRole`)
- 테스트명: 한국어 문장형
- React import: 테스트 파일 최상단에 `// biome-ignore lint/correctness/noUnusedImports: need for proper rendering` 주석과 함께 추가 (`.test.tsx`만 해당)

**테스트 환경 — `vitest-setup.ts`**
`@base-ui/react` 컴포넌트(Tooltip, Combobox 등)를 테스트하려면 `ResizeObserver`를 모킹해야 한다. JSDOM에 기본 구현이 없어 런타임 오류가 발생한다.
```ts
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
```

**Mock — `vi.hoisted` 패턴**
`vi.mock`은 호이스팅되므로 블록 바깥 변수를 참조할 수 없다. 반드시 `vi.hoisted`로 감싼다.
```ts
const mockCreateAgent = vi.hoisted(() => vi.fn());
vi.mock("../repository/agent-repository", () => ({ createAgent: mockCreateAgent }));

beforeEach(() => { mockCreateAgent.mockClear(); });
```

**Assertion — 리스트 항목 스코핑**
같은 role이 여러 개일 때 `within()`으로 스코핑한다. 비동기 진입은 `findBy*`, 이후 동기 검증은 `getBy*`.
```ts
const dialog = screen.getByRole("dialog");
const item = await within(dialog).findByLabelText("agent-1");
expect(within(item).getByRole("button", { name: "삭제" })).toBeInTheDocument();
```
트리거 버튼과 다이얼로그 내부 버튼의 이름이 같을 때도 `within(dialog)`로 스코핑한다.

**`test.each` — 필수 필드 누락 조합 검증**
여러 케이스가 하나의 assertion 패턴으로 수렴할 때만 쓴다. `inputCases` 배열로 입력할 필드 목록을 정의하고 반복 입력한다.
```tsx
test.each([
  { inputCases: [] },
  { inputCases: [{ name: "에이전트 이름", value: "..." }] },
  // ... 나머지 조합
])("필수 값을 입력하지 않으면 저장 버튼이 비활성화 상태이다.", async ({ inputCases }) => {
  renderWithTooltip();
  await userEvent.click(screen.getByRole("button", { name: "에이전트 등록" }));
  for (const targetInput of inputCases) {
    await userEvent.type(screen.getByRole("textbox", { name: targetInput.name }), targetInput.value);
  }
  expect(screen.getByRole("button", { name: "저장" })).toBeDisabled();
});
```
수정 폼은 pre-filled 필드가 있으므로 빈 필드를 채워 "모두 입력" 상태를 만든 뒤, 특정 필드를 `userEvent.clear()`로 지워 비활성화를 검증한다.

**콜백 인자 검증**
콜백 호출은 인자가 있으면 반드시 `toHaveBeenCalledWith`로 인자까지 검증한다. `toHaveBeenCalledTimes(1)` 단독으로는 인자 변경을 감지하지 못한다.

**SSE 콜백 캡처 패턴 (`sseHandler` 기반)**
`sseHandler` 유틸을 spy로 교체해 콜백 함수를 캡처한 뒤 테스트에서 직접 호출한다. 콜백 반환값이 `true`면 SSE 연결 종료, `false`면 유지.
```ts
let capturedCallback: (e: MessageEvent) => Promise<boolean>;

beforeEach(() => {
  vi.spyOn(sseHandler, "sseHandler").mockImplementation((_url, _callback) => {
    capturedCallback = _callback;
    return {} as EventSource;
  });
});

let callbackResult = false;
await act(async () => {
  callbackResult = await capturedCallback(
    new MessageEvent("message", { data: JSON.stringify({ type: "assigned" }) })
  );
});
await waitFor(() => {
  expect(callbackResult).toEqual(false);
});
```

**안티패턴**

| 금지 | 대안 |
|------|------|
| DOM 구조 직접 검사 | role/name 기반 쿼리 |
| renderer에서 Electron 모듈 직접 import | preload API 경유 |
| GREEN 단계에서 IPC까지 한 번에 구현 | 테스트가 요구하는 최소만 구현 |

---

## 소스 코드

- 컴포넌트: 함수형 + named export
- 공유 enum·타입: `src/types/`에 정의 (예: `TodoStatus` enum → `src/types/enums.ts`)
- 접근성: 인터랙티브 요소를 포함하는 리스트 항목은 `<section aria-label="{domain}-{id}">`로 감싼다
- 포맷: Biome (double quotes, 2-space indent)

---

## Repository 패턴

API 호출은 `frontend/src/repository/`에 `{domain}-repository.ts` 파일로 분리한다.

`getFastAPI()`를 모듈 레벨에서 한 번만 호출해 destructuring한다. 클래스/객체 래핑 금지, named export만 사용.
```ts
const {
  getAgentsApiAgentsGet,
  createAgentApiAgentsPost,
} = getFastAPI();

export const createAgent = async (request: PostAgentRequest): Promise<AgentResponse> => {
  const response = await createAgentApiAgentsPost(request);
  return response.data;
};
```

`getFastAPI()` mock에는 테스트 대상 함수와 무관하게 모듈에서 destructuring하는 **전체** 함수를 포함한다. 누락 시 다른 테스트/import에서 오류가 발생한다.

---

## 다이얼로그 패턴

**타이틀**: 모든 다이얼로그는 `DialogHeader` + `DialogTitle`로 타이틀을 노출한다. 테스트: `getByRole("heading", { name: "..." })`.

**X 버튼**: 기본적으로 우측 상단 X 버튼(`showCloseButton=true`) 렌더링. 취소 버튼 없이 X만으로 닫는 경우 취소 버튼은 추가하지 않는다.

**`DialogClose` 조건부 비활성화**: `DialogClose`에 직접 `disabled`를 주지 않고 `render` prop의 `Button`에 전달한다. disabled 상태의 HTML 버튼은 클릭 이벤트가 발생하지 않으므로 다이얼로그도 닫히지 않는다.
```tsx
<DialogClose
  render={<Button disabled={!name || !systemPrompt} />}
  onClick={() => void handleSave()}
>
  저장
</DialogClose>
```

**비동기 닫기**: 비동기 작업 완료 후 프로그래매틱하게 닫을 때는 `useState`로 `open` 상태를 직접 관리한다.

**폼 상태 초기화**: `useEffect`로 `open`을 의존성으로 사용한다. 취소/저장 후 재오픈 시 이전 입력값이 남지 않도록 보장한다.
```tsx
useEffect(() => {
  if (open) {
    setName(""); // 등록 폼: 빈 값 / 수정 폼: entity.name으로 복구
  }
}, [open]);
```

**폼 라벨**: `Label` + `htmlFor`/`id` 조합으로 접근성 보장. `aria-label` 직접 사용 금지.

**멀티셀렉트 콤보박스**: shadcn/ui `Combobox`의 `multiple` 모드 사용. 다이얼로그 폼에 인라인으로 작성하지 않고 별도 컴포넌트로 추출한다. `value`는 ID(UUID)를 사용하고 칩 표시는 `useMemo`로 만든 `Map<id, name>`으로 이름을 조회한다.

`userEvent.click(combobox)`는 팝업을 열지 않는다. `@base-ui/react`의 `handleInputPress`가 input 클릭 시 조기 반환하기 때문이다. `[data-slot="combobox-chips"]` 컨테이너에 `fireEvent.mouseDown`을 사용한다.
```tsx
const chipsContainer = screen.getByRole("combobox").closest('[data-slot="combobox-chips"]');
fireEvent.mouseDown(chipsContainer as Element);
expect(await screen.findByRole("option", { name: "웹 서치(web search)" })).toBeInTheDocument();
```

**툴팁**: `TooltipProvider`를 `App.tsx`에 전역 배치. 테스트에서는 `withTooltipProvider()`로 감싼다. `TooltipTrigger`에 `closeOnClick={false}` 필수 — 기본값이 `true`라 클릭 시 즉시 닫힌다.
