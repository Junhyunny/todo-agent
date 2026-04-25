import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import * as sseHandler from "../utils/sse-handler.ts";
import { MainWindow } from "./MainWindow.tsx";

const mockGetAgents = vi.hoisted(() => vi.fn());
const mockCreateAgent = vi.hoisted(() => vi.fn());
const mockExistsAgentByName = vi.hoisted(() => vi.fn());
vi.mock("../repository/agent-repository", () => ({
  getAgents: mockGetAgents,
  createAgent: mockCreateAgent,
  existsAgentByName: mockExistsAgentByName,
}));

const mockGetTodos = vi.hoisted(() => vi.fn());
const mockCreateTodo = vi.hoisted(() => vi.fn());
const mockDeleteTodo = vi.hoisted(() => vi.fn());
vi.mock("../repository/todo-repository", () => ({
  getTodos: mockGetTodos,
  createTodo: mockCreateTodo,
  deleteTodo: mockDeleteTodo,
}));

const mockGetTools = vi.hoisted(() => vi.fn());
vi.mock("../repository/tool-repository", () => ({
  getTools: mockGetTools,
}));

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

describe("MainWindow", () => {
  beforeEach(() => {
    capturedEventSources = [];
    vi.stubGlobal("EventSource", MockEventSource);
    mockGetAgents.mockClear();
    mockGetAgents.mockResolvedValue([]);
    mockCreateAgent.mockClear();
    mockCreateAgent.mockResolvedValue({});
    mockExistsAgentByName.mockClear();
    mockExistsAgentByName.mockResolvedValue(false);
    mockGetTodos.mockClear();
    mockGetTodos.mockResolvedValue([]);
    mockCreateTodo.mockClear();
    mockCreateTodo.mockResolvedValue({});
    mockDeleteTodo.mockClear();
    mockDeleteTodo.mockResolvedValue(undefined);
    mockGetTools.mockClear();
    mockGetTools.mockResolvedValue([{ id: "1", name: "웹 검색(web search)" }]);
  });

  test("메인 화면에서 TODO 등록 버튼이 보인다", () => {
    render(<MainWindow />);
    const buttonArea = screen.getByRole("region", { name: "버튼 영역" });
    expect(
      within(buttonArea).getByRole("button", { name: "TODO 등록" }),
    ).toBeInTheDocument();
  });

  test("메인 화면에서 + 버튼이 렌더링된다", () => {
    render(<MainWindow />);
    const buttonArea = screen.getByRole("region", { name: "버튼 영역" });
    expect(
      within(buttonArea).getByRole("button", { name: "에이전트 등록" }),
    ).toBeInTheDocument();
  });

  test("화면에서 에이전트 아이콘이 + 버튼 오른쪽에 렌더링된다", () => {
    render(<MainWindow />);
    const buttonArea = screen.getByRole("region", { name: "버튼 영역" });
    const agentButton = within(buttonArea).getByRole("button", {
      name: "agent",
    });
    expect(
      within(agentButton).getByRole("img", { name: "agent-icon" }),
    ).toBeInTheDocument();
  });

  test("+ 버튼을 클릭하면 에이전트 이름·시스템프롬프트 입력 필드와 저장 버튼이 포함된 다이얼로그가 열린다", async () => {
    render(<MainWindow />);
    const buttonArea = screen.getByRole("region", { name: "버튼 영역" });
    await userEvent.click(
      within(buttonArea).getByRole("button", { name: "에이전트 등록" }),
    );
    expect(
      screen.getByRole("textbox", { name: "에이전트 이름" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "시스템 프롬프트" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "저장" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "취소" }),
    ).not.toBeInTheDocument();
  });

  test("에이전트 아이콘을 클릭하면 에이전트 리스트 다이얼로그가 열린다", async () => {
    mockGetAgents.mockResolvedValue([
      {
        id: "1",
        name: "에이전트A",
        description: "",
        system_prompt: "프롬프트A",
        tools: [],
      },
      {
        id: "2",
        name: "에이전트B",
        description: "",
        system_prompt: "프롬프트B",
        tools: [],
      },
    ]);

    render(<MainWindow />);
    const buttonArea = screen.getByRole("region", { name: "버튼 영역" });
    await userEvent.click(
      within(buttonArea).getByRole("button", { name: "agent" }),
    );

    const dialog = screen.getByRole("dialog");
    expect(await within(dialog).findByText("에이전트A")).toBeInTheDocument();
    expect(within(dialog).getByText("에이전트B")).toBeInTheDocument();
    expect(mockGetAgents).toHaveBeenCalledTimes(1);
  });

  test("마운트 시 저장된 TODO 목록을 표시한다 (앱 재실행 유지)", async () => {
    mockGetTodos.mockResolvedValue([
      { id: "1", title: "할 일 A", content: "내용 A", status: "pending" },
    ]);

    render(<MainWindow />);
    const todoList = screen.getByRole("region", { name: "TODO 목록" });
    expect(await within(todoList).findByText("할 일 A")).toBeInTheDocument();
    expect(mockGetTodos).toHaveBeenCalledTimes(1);
  });

  test("저장 후 메인 화면에 TODO 제목이 노출된다", async () => {
    mockGetTodos
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { id: "1", title: "새 할 일", content: "내용", status: "pending" },
      ]);
    mockCreateTodo.mockResolvedValue({
      id: "1",
      title: "새 할 일",
      content: "내용",
      status: "pending",
    });

    render(<MainWindow />);
    const buttonArea = screen.getByRole("region", { name: "버튼 영역" });
    await userEvent.click(
      within(buttonArea).getByRole("button", { name: "TODO 등록" }),
    );
    const dialog = screen.getByRole("dialog");
    await userEvent.type(
      within(dialog).getByRole("textbox", { name: "제목" }),
      "새 할 일",
    );
    await userEvent.type(
      within(dialog).getByRole("textbox", { name: "내용" }),
      "내용",
    );
    await userEvent.click(within(dialog).getByRole("button", { name: "저장" }));

    const todoList = screen.getByRole("region", { name: "TODO 목록" });
    expect(await within(todoList).findByText("새 할 일")).toBeInTheDocument();
  });

  test("저장 후 TODO 항목 오른쪽에 회색 대기 중 아이콘이 노출된다", async () => {
    mockGetTodos
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { id: "1", title: "새 할 일", content: "내용", status: "pending" },
      ]);
    mockCreateTodo.mockResolvedValue({
      id: "1",
      title: "새 할 일",
      content: "내용",
      status: "pending",
    });

    render(<MainWindow />);
    const buttonArea = screen.getByRole("region", { name: "버튼 영역" });
    await userEvent.click(
      within(buttonArea).getByRole("button", { name: "TODO 등록" }),
    );
    const dialog = screen.getByRole("dialog");
    await userEvent.type(
      within(dialog).getByRole("textbox", { name: "제목" }),
      "새 할 일",
    );
    await userEvent.type(
      within(dialog).getByRole("textbox", { name: "내용" }),
      "내용",
    );
    await userEvent.click(within(dialog).getByRole("button", { name: "저장" }));

    const todoList = screen.getByRole("region", { name: "TODO 목록" });
    await within(todoList).findByText("새 할 일");
    const todoSection = within(todoList).getByRole("button", {
      name: "todo-1",
    });
    expect(
      within(todoSection).getByLabelText("에이전트 할당 대기"),
    ).toBeInTheDocument();
  });

  test("todo 저장 시 EventSource를 생성한다", async () => {
    const mockSseHandler = vi
      .spyOn(sseHandler, "sseHandler")
      .mockImplementation((_url: string, _callback) => ({}) as EventSource);
    mockGetTodos
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { id: "1", title: "새 할 일", content: "내용", status: "pending" },
      ]);
    mockCreateTodo.mockResolvedValue({
      id: "1",
      title: "새 할 일",
      content: "내용",
      status: "pending",
    });

    render(<MainWindow />);
    const buttonArea = screen.getByRole("region", { name: "버튼 영역" });
    await userEvent.click(
      within(buttonArea).getByRole("button", { name: "TODO 등록" }),
    );
    const dialog = screen.getByRole("dialog");
    await userEvent.type(
      within(dialog).getByRole("textbox", { name: "제목" }),
      "새 할 일",
    );
    await userEvent.type(
      within(dialog).getByRole("textbox", { name: "내용" }),
      "내용",
    );
    await userEvent.click(within(dialog).getByRole("button", { name: "저장" }));

    const todoList = screen.getByRole("region", { name: "TODO 목록" });
    await within(todoList).findByText("새 할 일");
    expect(mockSseHandler).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/api/todos/1/events",
      expect.any(Function),
    );
  });

  test("삭제 버튼을 누르면 deleteTodo가 todo id와 함께 호출된다", async () => {
    mockGetTodos.mockResolvedValue([
      { id: "1", title: "할 일 A", content: "내용 A", status: "pending" },
    ]);
    render(<MainWindow />);
    const todoList = screen.getByRole("region", { name: "TODO 목록" });
    await within(todoList).findByText("할 일 A");

    await userEvent.click(
      within(todoList).getByRole("button", { name: "todo-1" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "삭제" }));
    await userEvent.click(screen.getByRole("button", { name: "삭제" }));

    expect(mockDeleteTodo).toHaveBeenCalledWith("1");
  });

  test("삭제 후 getTodos를 다시 호출하여 목록을 갱신한다", async () => {
    mockGetTodos
      .mockResolvedValueOnce([
        { id: "1", title: "할 일 A", content: "내용 A", status: "pending" },
      ])
      .mockResolvedValueOnce([]);
    render(<MainWindow />);
    const todoList = screen.getByRole("region", { name: "TODO 목록" });
    await within(todoList).findByText("할 일 A");

    await userEvent.click(
      within(todoList).getByRole("button", { name: "todo-1" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "삭제" }));
    await userEvent.click(screen.getByRole("button", { name: "삭제" }));

    await waitFor(() => {
      expect(within(todoList).queryByText("할 일 A")).not.toBeInTheDocument();
    });
  });

  describe("SSE assigned event handling", () => {
    let capturedCallback: (e: MessageEvent) => Promise<boolean>;
    beforeEach(() => {
      vi.spyOn(sseHandler, "sseHandler").mockImplementation(
        (_url: string, _callback) => {
          capturedCallback = _callback;
          return {} as EventSource;
        },
      );
      mockCreateTodo.mockResolvedValue({
        id: "1",
        title: "새 할 일",
        content: "내용",
        status: "pending",
      });
    });

    test("SSE assigned 이벤트 수신 시 getTodos를 다시 호출하고, 에이전트가 할당된 것을 확인할 수 있다", async () => {
      mockGetTodos
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          { id: "1", title: "새 할 일", content: "내용", status: "pending" },
        ])
        .mockResolvedValueOnce([
          {
            id: "1",
            title: "새 할 일",
            content: "내용",
            status: "assigned",
            assigned_agent_name: "검색 에이전트",
          },
        ]);

      render(<MainWindow />);
      const buttonArea = screen.getByRole("region", { name: "버튼 영역" });
      await userEvent.click(
        within(buttonArea).getByRole("button", { name: "TODO 등록" }),
      );
      const dialog = screen.getByRole("dialog");
      await userEvent.type(
        within(dialog).getByRole("textbox", { name: "제목" }),
        "새 할 일",
      );
      await userEvent.type(
        within(dialog).getByRole("textbox", { name: "내용" }),
        "내용",
      );
      await userEvent.click(
        within(dialog).getByRole("button", { name: "저장" }),
      );
      const todoList = screen.getByRole("region", { name: "TODO 목록" });
      await within(todoList).findByText("새 할 일");

      let callbackResult = false;
      await act(async () => {
        callbackResult = await capturedCallback(
          new MessageEvent("message", {
            data: JSON.stringify({
              type: "assigned",
              agent_name: "검색 에이전트",
            }),
          }),
        );
      });

      await waitFor(() => {
        expect(callbackResult).toEqual(false);
        expect(mockGetTodos).toHaveBeenCalledTimes(3);
        expect(
          within(todoList).getByLabelText("에이전트 작업 중"),
        ).toBeInTheDocument();
      });
    });

    test("SSE completed 이벤트 수신 시 getTodos를 다시 호출하고, 작업 완료 아이콘이 보인다", async () => {
      mockGetTodos
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          { id: "1", title: "새 할 일", content: "내용", status: "pending" },
        ])
        .mockResolvedValueOnce([
          {
            id: "1",
            title: "새 할 일",
            content: "내용",
            status: "completed",
            assigned_agent_name: "검색 에이전트",
            result: "처리 완료",
          },
        ]);

      render(<MainWindow />);
      const buttonArea = screen.getByRole("region", { name: "버튼 영역" });
      await userEvent.click(
        within(buttonArea).getByRole("button", { name: "TODO 등록" }),
      );
      const dialog = screen.getByRole("dialog");
      await userEvent.type(
        within(dialog).getByRole("textbox", { name: "제목" }),
        "새 할 일",
      );
      await userEvent.type(
        within(dialog).getByRole("textbox", { name: "내용" }),
        "내용",
      );
      await userEvent.click(
        within(dialog).getByRole("button", { name: "저장" }),
      );
      const todoList = screen.getByRole("region", { name: "TODO 목록" });
      await within(todoList).findByText("새 할 일");

      let callbackResult = false;
      await act(async () => {
        callbackResult = await capturedCallback(
          new MessageEvent("message", {
            data: JSON.stringify({
              type: "completed",
              agent_name: "검색 에이전트",
            }),
          }),
        );
      });

      await waitFor(() => {
        expect(callbackResult).toEqual(true);
        expect(mockGetTodos).toHaveBeenCalledTimes(3);
        expect(
          within(todoList).getByLabelText("작업 완료"),
        ).toBeInTheDocument();
      });
    });

    test("SSE failed 이벤트 수신 시 getTodos를 다시 호출하고, X 아이콘이 보인다", async () => {
      mockGetTodos
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          { id: "1", title: "새 할 일", content: "내용", status: "pending" },
        ])
        .mockResolvedValueOnce([
          {
            id: "1",
            title: "새 할 일",
            content: "내용",
            status: "failed",
          },
        ]);

      render(<MainWindow />);
      const buttonArea = screen.getByRole("region", { name: "버튼 영역" });
      await userEvent.click(
        within(buttonArea).getByRole("button", { name: "TODO 등록" }),
      );
      const dialog = screen.getByRole("dialog");
      await userEvent.type(
        within(dialog).getByRole("textbox", { name: "제목" }),
        "새 할 일",
      );
      await userEvent.type(
        within(dialog).getByRole("textbox", { name: "내용" }),
        "내용",
      );
      await userEvent.click(
        within(dialog).getByRole("button", { name: "저장" }),
      );
      const todoList = screen.getByRole("region", { name: "TODO 목록" });
      await within(todoList).findByText("새 할 일");

      let callbackResult = false;
      await act(async () => {
        callbackResult = await capturedCallback(
          new MessageEvent("message", {
            data: JSON.stringify({
              type: "failed",
              agent_name: "",
            }),
          }),
        );
      });

      await waitFor(() => {
        expect(callbackResult).toEqual(true);
        expect(mockGetTodos).toHaveBeenCalledTimes(3);
        expect(
          within(todoList).getByLabelText("에이전트 할당 실패"),
        ).toBeInTheDocument();
      });
    });

    test("SSE assigned 이벤트 수신 받지 못하면 false를 반환하고, getTodos를 호출하지 않는다", async () => {
      mockGetTodos
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          { id: "1", title: "새 할 일", content: "내용", status: "pending" },
        ])
        .mockResolvedValueOnce([
          { id: "1", title: "새 할 일", content: "내용", status: "pending" },
        ]);

      render(<MainWindow />);
      const buttonArea = screen.getByRole("region", { name: "버튼 영역" });
      await userEvent.click(
        within(buttonArea).getByRole("button", { name: "TODO 등록" }),
      );
      const dialog = screen.getByRole("dialog");
      await userEvent.type(
        within(dialog).getByRole("textbox", { name: "제목" }),
        "새 할 일",
      );
      await userEvent.type(
        within(dialog).getByRole("textbox", { name: "내용" }),
        "내용",
      );
      await userEvent.click(
        within(dialog).getByRole("button", { name: "저장" }),
      );
      const todoList = screen.getByRole("region", { name: "TODO 목록" });
      await within(todoList).findByText("새 할 일");

      let callbackResult = false;
      await act(async () => {
        callbackResult = await capturedCallback(
          new MessageEvent("message", {
            data: JSON.stringify({
              type: "not_assigned",
              agent_name: "",
            }),
          }),
        );
      });

      await waitFor(() => {
        expect(callbackResult).toEqual(false);
        expect(mockGetTodos).toHaveBeenCalledTimes(2);
        expect(
          within(todoList).getByLabelText("에이전트 할당 대기"),
        ).toBeInTheDocument();
      });
    });
  });
});
