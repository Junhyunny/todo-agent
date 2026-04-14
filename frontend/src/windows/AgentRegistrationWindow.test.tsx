import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
import { describe, expect, test, vi } from "vitest";
import { AgentRegistrationWindow } from "./AgentRegistrationWindow.tsx";

const mockCreateAgent = vi.hoisted(() => vi.fn());
vi.mock("../repository/agent-repository", () => ({
  createAgent: mockCreateAgent,
}));

describe("AgentRegistrationWindow", () => {
  test("에이전트 이름 입력 필드가 보인다", async () => {
    render(<AgentRegistrationWindow />);

    await userEvent.click(screen.getByRole("button", { name: "+" }));

    expect(
      screen.getByRole("textbox", { name: "에이전트 이름" }),
    ).toBeInTheDocument();
  });

  test("시스템 프롬프트 입력 필드가 보인다", async () => {
    render(<AgentRegistrationWindow />);

    await userEvent.click(screen.getByRole("button", { name: "+" }));

    expect(
      screen.getByRole("textbox", { name: "시스템 프롬프트" }),
    ).toBeInTheDocument();
  });

  test("저장 버튼과 취소 버튼이 보인다", async () => {
    render(<AgentRegistrationWindow />);

    await userEvent.click(screen.getByRole("button", { name: "+" }));

    expect(screen.getByRole("button", { name: "저장" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
  });

  test("취소 버튼을 클릭하면 에이전트 등록 윈도우 닫기 요청을 보낸다", async () => {
    render(<AgentRegistrationWindow />);

    await userEvent.click(screen.getByRole("button", { name: "+" }));
    await userEvent.click(screen.getByRole("button", { name: "취소" }));

    expect(
      screen.queryByText("agent-registration-dialog"),
    ).not.toBeInTheDocument();
  });

  test("이름과 시스템 프롬프트를 입력하고 저장 버튼을 클릭하면 AgentsService.createAgent를 호출하고 윈도우를 닫는다", async () => {
    mockCreateAgent.mockResolvedValue({
      id: "1",
      name: "테스트",
      system_prompt: "프롬프트",
    });
    render(<AgentRegistrationWindow />);

    await userEvent.click(screen.getByRole("button", { name: "+" }));
    await userEvent.type(
      screen.getByRole("textbox", { name: "에이전트 이름" }),
      "테스트 에이전트",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "시스템 프롬프트" }),
      "너는 AI야",
    );
    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(mockCreateAgent).toHaveBeenCalledWith({
      name: "테스트 에이전트",
      system_prompt: "너는 AI야",
    });
  });
});
