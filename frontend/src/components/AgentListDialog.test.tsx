import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event/dist/cjs/index.js";
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AgentListDialog } from "./AgentListDialog.tsx";

const mockGetAgents = vi.hoisted(() => vi.fn());
const mockUpdateAgent = vi.hoisted(() => vi.fn());
const mockDeleteAgent = vi.hoisted(() => vi.fn());
vi.mock("../repository/agent-repository", () => ({
  getAgents: mockGetAgents,
  updateAgent: mockUpdateAgent,
  deleteAgent: mockDeleteAgent,
}));

describe("AgentListDialog", () => {
  beforeEach(() => {
    mockGetAgents.mockClear();
    mockUpdateAgent.mockClear();
    mockDeleteAgent.mockClear();
    mockGetAgents.mockResolvedValue([]);
    mockUpdateAgent.mockResolvedValue({
      id: "1",
      name: "에이전트A",
      system_prompt: "프롬프트A",
    });
    mockDeleteAgent.mockResolvedValue(undefined);
  });

  test("다이얼로그를 열 수 있는 버튼이 보인다.", () => {
    render(<AgentListDialog />);

    expect(screen.getByRole("button", { name: "agent" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("버튼을 누르면 다이얼로그가 보이고, 에이전트 이름과 프롬프트가 보인다.", async () => {
    mockGetAgents.mockResolvedValue([
      { id: "1", name: "에이전트A", system_prompt: "프롬프트A" },
      { id: "2", name: "에이전트B", system_prompt: "프롬프트B" },
    ]);

    render(<AgentListDialog />);

    await userEvent.click(screen.getByRole("button", { name: "agent" }));

    const dialog = screen.getByRole("dialog");
    const item1 = await within(dialog).findByLabelText(`agent-1`);
    const item2 = await within(dialog).findByLabelText(`agent-2`);
    expect(within(item1).getByText("에이전트A")).toBeInTheDocument();
    expect(within(item1).getByText("프롬프트A")).toBeInTheDocument();
    expect(within(item2).getByText("에이전트B")).toBeInTheDocument();
    expect(within(item2).getByText("프롬프트B")).toBeInTheDocument();
  });

  test("다이얼로그 외부를 누르면 다이얼로그가 닫힌다.", async () => {
    render(<AgentListDialog />);

    await userEvent.click(screen.getByRole("button", { name: "agent" }));
    await userEvent.click(document.body);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("각 에이전트 항목 오른쪽에 수정 버튼과 삭제 버튼이 보인다.", async () => {
    mockGetAgents.mockResolvedValue([
      { id: "1", name: "에이전트A", system_prompt: "프롬프트A" },
    ]);

    render(<AgentListDialog />);

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

  test("이전 화면으로 이동하는 버튼이 보인다.", async () => {
    render(<AgentListDialog />);

    await userEvent.click(screen.getByRole("button", { name: "agent" }));

    expect(
      await screen.findByRole("button", { name: "이전" }),
    ).toBeInTheDocument();
  });

  test("등록된 에이전트가 없으면 에이전트 목록이 비어 있다.", async () => {
    mockGetAgents.mockResolvedValue([]);

    render(<AgentListDialog />);

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

    render(<AgentListDialog />);

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

    render(<AgentListDialog />);

    await userEvent.click(screen.getByRole("button", { name: "agent" }));

    const dialog = screen.getByRole("dialog");
    const agentItem = await within(dialog).findByLabelText("agent-1");
    await userEvent.click(
      within(agentItem).getByRole("button", { name: "수정" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(mockGetAgents).toHaveBeenCalledTimes(2);
  });
});
