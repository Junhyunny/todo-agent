import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event/dist/cjs/index.js";
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AgentDeleteDialog } from "./AgentDeleteDialog.tsx";

const mockDeleteAgent = vi.hoisted(() => vi.fn());
vi.mock("../repository/agent-repository", () => ({
  deleteAgent: mockDeleteAgent,
}));

const agent = {
  id: "1",
  name: "테스트 에이전트",
  description: "",
  system_prompt: "테스트 프롬프트",
  tools: [],
};

describe("AgentDeleteDialog", () => {
  beforeEach(() => {
    mockDeleteAgent.mockClear();
    mockDeleteAgent.mockResolvedValue(undefined);
  });

  test("삭제 버튼이 보인다.", () => {
    render(<AgentDeleteDialog agent={agent} onDelete={vi.fn()} />);

    expect(screen.getByRole("button", { name: "삭제" })).toBeInTheDocument();
  });

  test("삭제 버튼을 클릭하면 '삭제하겠습니까?' 메시지가 표시된다.", async () => {
    render(<AgentDeleteDialog agent={agent} onDelete={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "삭제" }));

    expect(screen.getByText("삭제하겠습니까?")).toBeInTheDocument();
  });

  test("취소 버튼이 보이지 않는다.", async () => {
    render(<AgentDeleteDialog agent={agent} onDelete={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "삭제" }));

    expect(
      screen.queryByRole("button", { name: "취소" }),
    ).not.toBeInTheDocument();
  });

  test("다이얼로그 상단에 X 버튼이 보인다.", async () => {
    render(<AgentDeleteDialog agent={agent} onDelete={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "삭제" }));

    expect(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Close" }),
    ).toBeInTheDocument();
  });

  test("확인 버튼을 클릭하면 deleteAgent를 호출하고 onDelete 콜백을 실행한다", async () => {
    const mockOnDelete = vi.fn();
    render(<AgentDeleteDialog agent={agent} onDelete={mockOnDelete} />);

    await userEvent.click(screen.getByRole("button", { name: "삭제" }));
    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "삭제" }),
    );

    expect(mockDeleteAgent).toHaveBeenCalledWith("1");
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  test("삭제 성공 후 다이얼로그가 닫힌다", async () => {
    render(<AgentDeleteDialog agent={agent} onDelete={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "삭제" }));
    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "삭제" }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
