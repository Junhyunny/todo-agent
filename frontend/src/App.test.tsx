import { render, screen, within } from "@testing-library/react";
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
import { expect, test } from "vitest";
import { App } from "./App.tsx";

test("메인 화면에서 + 버튼이 렌더링된다", () => {
  render(<App />);
  expect(screen.getByRole("button", { name: "+" })).toBeInTheDocument();
});

test("화면에서 에이전트 아이콘이 + 버튼 오른쪽에 렌더링된다", () => {
  render(<App />);

  const agentButton = screen.getByRole("button", { name: "agent" });
  expect(
    within(agentButton).getByRole("img", { name: "agent-icon" }),
  ).toBeInTheDocument();
});
