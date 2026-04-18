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

  test("시트가 열리면 '해야할 일' 타이틀이 보인다", async () => {
    render(<TodoStatusSheet todo={mockTodo} />);

    await userEvent.click(
      screen.getByRole("button", { name: `todo-${mockTodo.id}` }),
    );

    expect(
      screen.getByRole("heading", { name: "해야할 일" }),
    ).toBeInTheDocument();
  });

  test("시트가 열리면 제목 필드가 비활성화 상태로 보인다", async () => {
    render(<TodoStatusSheet todo={mockTodo} />);

    await userEvent.click(
      screen.getByRole("button", { name: `todo-${mockTodo.id}` }),
    );

    expect(screen.getByRole("textbox", { name: "제목" })).toBeDisabled();
  });

  test("시트가 열리면 내용 필드가 비활성화 상태로 보인다", async () => {
    render(<TodoStatusSheet todo={mockTodo} />);

    await userEvent.click(
      screen.getByRole("button", { name: `todo-${mockTodo.id}` }),
    );

    expect(screen.getByRole("textbox", { name: "내용" })).toBeDisabled();
  });

  test("에이전트가 할당되지 않은 경우 '에이전트 할당 대기' 메시지가 보인다", async () => {
    render(<TodoStatusSheet todo={mockTodo} />);

    await userEvent.click(
      screen.getByRole("button", { name: `todo-${mockTodo.id}` }),
    );

    expect(screen.getByText("에이전트 할당 대기")).toBeInTheDocument();
  });

  test("에이전트가 할당되지 않은 경우 회색 동그란 아이콘이 보인다", async () => {
    render(<TodoStatusSheet todo={mockTodo} />);

    await userEvent.click(
      screen.getByRole("button", { name: `todo-${mockTodo.id}` }),
    );

    expect(
      screen.getByLabelText("에이전트 할당 대기 아이콘"),
    ).toBeInTheDocument();
  });
});
