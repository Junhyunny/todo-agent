import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event/dist/cjs/index.js";
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
import { describe, expect, test } from "vitest";
import { AgentEditDialog } from "./AgentEditDialog.tsx";

const agent = { id: "1", name: "테스트 에이전트", system_prompt: "테스트 프롬프트" };

describe("AgentEditDialog", () => {
  test("다이얼로그를 열면 에이전트 이름이 채워져 있다.", async () => {
    render(<AgentEditDialog agent={agent} />);

    await userEvent.click(screen.getByRole("button", { name: "수정" }));

    expect(screen.getByRole("textbox", { name: "에이전트 이름" })).toHaveValue(
      "테스트 에이전트",
    );
  });

  test("다이얼로그를 열면 시스템 프롬프트가 채워져 있다.", async () => {
    render(<AgentEditDialog agent={agent} />);

    await userEvent.click(screen.getByRole("button", { name: "수정" }));

    expect(screen.getByRole("textbox", { name: "시스템 프롬프트" })).toHaveValue(
      "테스트 프롬프트",
    );
  });

  test("취소 버튼을 클릭하면 다이얼로그가 닫힌다.", async () => {
    render(<AgentEditDialog agent={agent} />);

    await userEvent.click(screen.getByRole("button", { name: "수정" }));
    await userEvent.click(screen.getByRole("button", { name: "취소" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("저장 버튼이 보인다.", async () => {
    render(<AgentEditDialog agent={agent} />);

    await userEvent.click(screen.getByRole("button", { name: "수정" }));

    expect(screen.getByRole("button", { name: "저장" })).toBeInTheDocument();
  });
});
