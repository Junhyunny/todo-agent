import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
import { describe, expect, test, vi } from "vitest";
import { AgentRegistrationWindow } from "./AgentRegistrationWindow.tsx";

describe("AgentRegistrationWindow", () => {
  test("에이전트 이름 입력 필드가 보인다", () => {
    render(<AgentRegistrationWindow />);
    expect(
      screen.getByRole("textbox", { name: "에이전트 이름" }),
    ).toBeInTheDocument();
  });

  test("시스템 프롬프트 입력 필드가 보인다", () => {
    render(<AgentRegistrationWindow />);
    expect(
      screen.getByRole("textbox", { name: "시스템 프롬프트" }),
    ).toBeInTheDocument();
  });

  test("저장 버튼과 취소 버튼이 보인다", () => {
    render(<AgentRegistrationWindow />);
    expect(screen.getByRole("button", { name: "저장" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
  });

  test("취소 버튼을 클릭하면 에이전트 등록 윈도우 닫기 요청을 보낸다", async () => {
    const close = vi.fn();
    Object.defineProperty(window, "agentRegistration", {
      configurable: true,
      value: { close },
    });
    render(<AgentRegistrationWindow />);
    await userEvent.click(screen.getByRole("button", { name: "취소" }));
    expect(close).toHaveBeenCalledTimes(1);
  });
});
