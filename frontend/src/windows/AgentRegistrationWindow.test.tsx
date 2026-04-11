import { render, screen } from "@testing-library/react";
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
import { describe, expect, test } from "vitest";
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
});
