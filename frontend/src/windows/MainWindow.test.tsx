import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { MainWindow } from "./MainWindow.tsx";

const mockGetAgents = vi.hoisted(() => vi.fn());
const mockCreateAgent = vi.hoisted(() => vi.fn());
vi.mock("../repository/agent-repository", () => ({
  getAgents: mockGetAgents,
  createAgent: mockCreateAgent,
}));

describe("MainWindow", () => {
  beforeEach(() => {
    mockGetAgents.mockClear();
    mockGetAgents.mockResolvedValue([]);
    mockCreateAgent.mockClear();
    mockCreateAgent.mockResolvedValue({});
  });

  test("메인 화면에서 + 버튼이 렌더링된다", () => {
    render(<MainWindow />);
    expect(screen.getByRole("button", { name: "+" })).toBeInTheDocument();
  });

  test("화면에서 에이전트 아이콘이 + 버튼 오른쪽에 렌더링된다", () => {
    render(<MainWindow />);

    const agentButton = screen.getByRole("button", { name: "agent" });
    expect(
      within(agentButton).getByRole("img", { name: "agent-icon" }),
    ).toBeInTheDocument();
  });

  test("+ 버튼을 클릭하면 에이전트 이름·시스템프롬프트 입력 필드와 저장·취소 버튼이 포함된 다이얼로그가 열린다", async () => {
    render(<MainWindow />);

    await userEvent.click(screen.getByRole("button", { name: "+" }));
    expect(
      screen.getByRole("textbox", { name: "에이전트 이름" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "시스템 프롬프트" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "저장" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
  });

  test("에이전트 아이콘을 클릭하면 에이전트 리스트 다이얼로그가 열린다", async () => {
    mockGetAgents.mockResolvedValue([
      { id: "1", name: "에이전트A", system_prompt: "프롬프트A" },
      { id: "2", name: "에이전트B", system_prompt: "프롬프트B" },
    ]);

    render(<MainWindow />);

    await userEvent.click(screen.getByRole("button", { name: "agent" }));

    const dialog = screen.getByRole("dialog");
    expect(await within(dialog).findByText("에이전트A")).toBeInTheDocument();
    expect(within(dialog).getByText("에이전트B")).toBeInTheDocument();
    expect(mockGetAgents).toHaveBeenCalledTimes(1);
  });
});
