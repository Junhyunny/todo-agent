import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event/dist/cjs/index.js";
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
import { describe, expect, test } from "vitest";
import { AgentDeleteDialog } from "./AgentDeleteDialog.tsx";

const agent = {
  id: "1",
  name: "테스트 에이전트",
  system_prompt: "테스트 프롬프트",
};

describe("AgentDeleteDialog", () => {
  test("삭제 버튼이 보인다.", () => {
    render(<AgentDeleteDialog agent={agent} />);

    expect(screen.getByRole("button", { name: "삭제" })).toBeInTheDocument();
  });

  test("삭제 버튼을 클릭하면 '삭제하겠습니까?' 메시지가 표시된다.", async () => {
    render(<AgentDeleteDialog agent={agent} />);

    await userEvent.click(screen.getByRole("button", { name: "삭제" }));

    expect(screen.getByText("삭제하겠습니까?")).toBeInTheDocument();
  });

  test("취소 버튼을 클릭하면 다이얼로그가 닫힌다.", async () => {
    render(<AgentDeleteDialog agent={agent} />);

    await userEvent.click(screen.getByRole("button", { name: "삭제" }));
    await userEvent.click(screen.getByRole("button", { name: "취소" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
