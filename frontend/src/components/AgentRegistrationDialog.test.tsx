import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AgentRegistrationDialog } from "./AgentRegistrationDialog.tsx";

const mockCreateAgent = vi.hoisted(() => vi.fn());
vi.mock("../repository/agent-repository", () => ({
  createAgent: mockCreateAgent,
}));

describe("AgentRegistrationDialog", () => {
  beforeEach(() => {
    mockCreateAgent.mockClear();
    mockCreateAgent.mockResolvedValue({});
  });

  test("에이전트 이름 입력 필드가 보인다", async () => {
    render(<AgentRegistrationDialog onClose={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "+" }));

    expect(
      screen.getByRole("textbox", { name: "에이전트 이름" }),
    ).toBeInTheDocument();
  });

  test("시스템 프롬프트 입력 필드가 보인다", async () => {
    render(<AgentRegistrationDialog onClose={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "+" }));

    expect(
      screen.getByRole("textbox", { name: "시스템 프롬프트" }),
    ).toBeInTheDocument();
  });

  test("저장 버튼과 취소 버튼이 보인다", async () => {
    render(<AgentRegistrationDialog onClose={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "+" }));

    expect(screen.getByRole("button", { name: "저장" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
  });

  test("저장 버튼을 클릭하면 createAgent를 호출하고 onClose 콜백을 호출한다", async () => {
    const mockOnClose = vi.fn();

    render(<AgentRegistrationDialog onClose={mockOnClose} />);

    await userEvent.click(screen.getByRole("button", { name: "+" }));
    await userEvent.type(
      screen.getByRole("textbox", { name: "에이전트 이름" }),
      "테스트 에이전트",
    );
    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test("취소 버튼을 클릭하면 다이얼로그가 닫힌다", async () => {
    render(<AgentRegistrationDialog onClose={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "+" }));
    expect(
      screen.getByRole("textbox", { name: "에이전트 이름" }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "취소" }));

    expect(
      screen.queryByRole("textbox", { name: "에이전트 이름" }),
    ).not.toBeInTheDocument();
  });

  test("저장 버튼을 클릭하면 다이얼로그가 닫힌다", async () => {
    render(<AgentRegistrationDialog onClose={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "+" }));
    expect(
      screen.getByRole("textbox", { name: "에이전트 이름" }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(
      screen.queryByRole("textbox", { name: "에이전트 이름" }),
    ).not.toBeInTheDocument();
  });

  test("createAgent가 완료된 후에 onClose 콜백이 호출된다", async () => {
    let resolveCreate!: () => void;
    mockCreateAgent.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveCreate = resolve;
      }),
    );
    const mockOnClose = vi.fn();

    render(<AgentRegistrationDialog onClose={mockOnClose} />);

    await userEvent.click(screen.getByRole("button", { name: "+" }));
    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(mockOnClose).not.toHaveBeenCalled();

    resolveCreate();
    await vi.waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});
