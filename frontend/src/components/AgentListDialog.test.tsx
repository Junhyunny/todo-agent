import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event/dist/cjs/index.js";
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AgentListDialog } from "./AgentListDialog.tsx";

const mockGetAgents = vi.hoisted(() => vi.fn());
vi.mock("../repository/agent-repository", () => ({
  getAgents: mockGetAgents,
}));

describe("AgentListDialog", () => {
  beforeEach(() => {
    mockGetAgents.mockClear();
    mockGetAgents.mockResolvedValue([]);
  });

  test("다이얼로그를 열 수 있는 버튼이 보인다.", () => {
    render(<AgentListDialog />);

    expect(screen.getByRole("button", { name: "agent" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("버튼을 누르면 다이얼로그가 보인다.", async () => {
    mockGetAgents.mockResolvedValue([
      { id: "1", name: "에이전트A", system_prompt: "프롬프트A" },
      { id: "2", name: "에이전트B", system_prompt: "프롬프트B" },
    ]);

    render(<AgentListDialog />);

    await userEvent.click(screen.getByRole("button", { name: "agent" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(await screen.findByText("에이전트A")).toBeInTheDocument();
    expect(screen.getByText("에이전트B")).toBeInTheDocument();
  });

  test("다이얼로그 외부를 누르면 다이얼로그가 닫힌다.", async () => {
    render(<AgentListDialog />);

    await userEvent.click(screen.getByRole("button", { name: "agent" }));
    await userEvent.click(document.body);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
