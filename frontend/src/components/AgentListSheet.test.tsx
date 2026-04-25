import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event/dist/cjs/index.js";
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AgentListSheet } from "./AgentListSheet.tsx";

const mockGetAgents = vi.hoisted(() => vi.fn());
const mockUpdateAgent = vi.hoisted(() => vi.fn());
const mockDeleteAgent = vi.hoisted(() => vi.fn());
vi.mock("../repository/agent-repository", () => ({
  getAgents: mockGetAgents,
  updateAgent: mockUpdateAgent,
  deleteAgent: mockDeleteAgent,
}));

const mockGetTools = vi.hoisted(() => vi.fn());
vi.mock("../repository/tool-repository", () => ({
  getTools: mockGetTools,
}));

describe("AgentListSheet", () => {
  beforeEach(() => {
    mockGetAgents.mockClear();
    mockUpdateAgent.mockClear();
    mockDeleteAgent.mockClear();
    mockGetTools.mockClear();
    mockGetAgents.mockResolvedValue([]);
    mockUpdateAgent.mockResolvedValue({
      id: "1",
      name: "에이전트A",
      system_prompt: "프롬프트A",
    });
    mockDeleteAgent.mockResolvedValue(undefined);
    mockGetTools.mockResolvedValue([{ id: "1", name: "웹 검색(web search)" }]);
  });

  test("시트를 열 수 있는 버튼이 보인다.", () => {
    render(<AgentListSheet />);

    expect(screen.getByRole("button", { name: "agent" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("시트를 열면 에이전트 목록 제목이 보인다.", async () => {
    render(<AgentListSheet />);

    await userEvent.click(screen.getByRole("button", { name: "agent" }));

    const dialog = screen.getByRole("dialog");
    expect(
      await within(dialog).findByRole("heading", { name: "에이전트 목록" }),
    ).toBeInTheDocument();
  });

  test("버튼을 누르면 시트가 보이고, 에이전트 이름이 보이고 설명은 보이지 않는다.", async () => {
    mockGetAgents.mockResolvedValue([
      { id: "1", name: "에이전트A", system_prompt: "프롬프트A" },
      { id: "2", name: "에이전트B", system_prompt: "프롬프트B" },
    ]);

    render(<AgentListSheet />);

    await userEvent.click(screen.getByRole("button", { name: "agent" }));

    const dialog = screen.getByRole("dialog");
    const item1 = await within(dialog).findByLabelText(`agent-1`);
    const item2 = await within(dialog).findByLabelText(`agent-2`);
    expect(within(item1).getByText("에이전트A")).toBeInTheDocument();
    expect(within(item1).queryByText("프롬프트A")).not.toBeInTheDocument();
    expect(within(item2).getByText("에이전트B")).toBeInTheDocument();
    expect(within(item2).queryByText("프롬프트B")).not.toBeInTheDocument();
  });

  test("시트 외부를 누르면 시트가 닫힌다.", async () => {
    render(<AgentListSheet />);

    await userEvent.click(screen.getByRole("button", { name: "agent" }));
    await userEvent.click(document.body);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("각 에이전트 항목 오른쪽에 수정 버튼과 삭제 버튼이 보인다.", async () => {
    mockGetAgents.mockResolvedValue([
      { id: "1", name: "에이전트A", system_prompt: "프롬프트A" },
    ]);

    render(<AgentListSheet />);

    await userEvent.click(screen.getByRole("button", { name: "agent" }));

    const dialog = screen.getByRole("dialog");
    const agentItem = within(dialog).getByLabelText(`agent-1`);
    expect(
      await within(agentItem).findByRole("button", { name: "수정" }),
    ).toBeInTheDocument();
    expect(
      within(agentItem).getByRole("button", { name: "삭제" }),
    ).toBeInTheDocument();
  });

  test("등록된 에이전트가 없으면 에이전트 목록이 비어 있다.", async () => {
    mockGetAgents.mockResolvedValue([]);

    render(<AgentListSheet />);

    await userEvent.click(screen.getByRole("button", { name: "agent" }));

    expect(
      screen.queryByRole("button", { name: "수정" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "삭제" }),
    ).not.toBeInTheDocument();
  });

  test("삭제 확인 후 에이전트 목록이 갱신된다.", async () => {
    mockGetAgents.mockResolvedValue([
      { id: "1", name: "에이전트A", system_prompt: "프롬프트A" },
    ]);

    render(<AgentListSheet />);

    await userEvent.click(screen.getByRole("button", { name: "agent" }));

    const dialog = screen.getByRole("dialog");
    const agentItem = await within(dialog).findByLabelText("agent-1");
    await userEvent.click(
      within(agentItem).getByRole("button", { name: "삭제" }),
    );
    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "삭제" }),
    );

    expect(mockGetAgents).toHaveBeenCalledTimes(2);
  });

  test("수정 저장 후 에이전트 목록이 갱신된다.", async () => {
    mockGetAgents.mockResolvedValue([
      { id: "1", name: "에이전트A", system_prompt: "프롬프트A" },
    ]);

    render(<AgentListSheet />);

    await userEvent.click(screen.getByRole("button", { name: "agent" }));

    const dialog = screen.getByRole("dialog");
    const agentItem = await within(dialog).findByLabelText("agent-1");
    await userEvent.click(
      within(agentItem).getByRole("button", { name: "수정" }),
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "설명" }),
      "테스트 설명",
    );
    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(mockGetAgents).toHaveBeenCalledTimes(2);
  });
});
