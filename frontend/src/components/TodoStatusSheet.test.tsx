import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event/dist/cjs/index.js";
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
import { describe, expect, test } from "vitest";
import { TodoStatusSheet } from "./TodoStatusSheet.tsx";

const mockTodo = {
  id: "test-id-1",
  title: "테스트 TODO",
  content: "테스트 내용",
  status: "pending",
};

describe("TodoStatusSheet", () => {
  test("TODO 항목을 탭하면 상태 시트가 열린다", async () => {
    render(<TodoStatusSheet todo={mockTodo} />);

    await userEvent.click(
      screen.getByRole("button", { name: `todo-${mockTodo.id}` }),
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
