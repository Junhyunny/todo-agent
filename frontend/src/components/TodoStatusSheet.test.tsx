import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event/dist/cjs/index.js";
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
import { describe, expect, test, vi } from "vitest";
import { TodoStatusSheet } from "./TodoStatusSheet.tsx";

const mockTodo = {
  id: "test-id-1",
  title: "테스트 TODO",
  content: "테스트 내용",
  status: "pending",
};

const mockAssignedTodo = {
  ...mockTodo,
  assigned_agent_name: "검색 에이전트",
  status: "in_progress",
};

const mockCompletedTodo = {
  ...mockTodo,
  assigned_agent_name: "검색 에이전트",
  status: "completed",
  result: "작업 결과입니다",
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

  test("에이전트가 할당된 TODO 항목에는 spinner 아이콘이 보인다", () => {
    render(<TodoStatusSheet todo={mockAssignedTodo} />);

    expect(screen.getByLabelText("작업 중")).toBeInTheDocument();
  });

  test("시트가 열리면 '검색 에이전트 에이전트 작업 중' 메시지가 보인다", async () => {
    render(<TodoStatusSheet todo={mockAssignedTodo} />);

    await userEvent.click(
      screen.getByRole("button", { name: `todo-${mockAssignedTodo.id}` }),
    );

    expect(
      screen.getByText("검색 에이전트 에이전트 작업 중"),
    ).toBeInTheDocument();
  });

  test("시트가 열리면 에이전트 작업 중 spinner 아이콘이 보인다", async () => {
    render(<TodoStatusSheet todo={mockAssignedTodo} />);

    await userEvent.click(
      screen.getByRole("button", { name: `todo-${mockAssignedTodo.id}` }),
    );

    expect(
      screen.getByLabelText("에이전트 작업 중 아이콘"),
    ).toBeInTheDocument();
  });

  test("작업이 완료된 TODO 항목에는 초록 체크박스 아이콘이 보인다", () => {
    render(<TodoStatusSheet todo={mockCompletedTodo} />);

    expect(screen.getByLabelText("작업 완료")).toBeInTheDocument();
  });

  test("시트가 열리면 '작업 완료' 메시지가 보인다", async () => {
    render(<TodoStatusSheet todo={mockCompletedTodo} />);

    await userEvent.click(
      screen.getByRole("button", { name: `todo-${mockCompletedTodo.id}` }),
    );

    expect(screen.getByText("작업 완료")).toBeInTheDocument();
  });

  test("시트가 열리면 작업 완료 아이콘이 보인다", async () => {
    render(<TodoStatusSheet todo={mockCompletedTodo} />);

    await userEvent.click(
      screen.getByRole("button", { name: `todo-${mockCompletedTodo.id}` }),
    );

    expect(screen.getByLabelText("작업 완료 아이콘")).toBeInTheDocument();
  });

  test("작업 완료 영역을 탭하면 작업 결과 다이얼로그가 열린다", async () => {
    render(<TodoStatusSheet todo={mockCompletedTodo} />);

    await userEvent.click(
      screen.getByRole("button", { name: `todo-${mockCompletedTodo.id}` }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "작업 결과 보기" }),
    );

    expect(
      screen.getByRole("heading", { name: "작업 결과" }),
    ).toBeInTheDocument();
  });

  test("작업 결과 다이얼로그에 작업 결과 내용이 보인다", async () => {
    render(<TodoStatusSheet todo={mockCompletedTodo} />);

    await userEvent.click(
      screen.getByRole("button", { name: `todo-${mockCompletedTodo.id}` }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "작업 결과 보기" }),
    );

    expect(screen.getByText("작업 결과입니다")).toBeInTheDocument();
  });

  test("작업 결과 다이얼로그에 닫기 버튼이 있다", async () => {
    render(<TodoStatusSheet todo={mockCompletedTodo} />);

    await userEvent.click(
      screen.getByRole("button", { name: `todo-${mockCompletedTodo.id}` }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "작업 결과 보기" }),
    );

    expect(screen.getByRole("button", { name: "닫기" })).toBeInTheDocument();
  });

  test("시트가 열리면 삭제 버튼이 보인다", async () => {
    render(<TodoStatusSheet todo={mockTodo} />);

    await userEvent.click(
      screen.getByRole("button", { name: `todo-${mockTodo.id}` }),
    );

    expect(screen.getByRole("button", { name: "삭제" })).toBeInTheDocument();
  });

  test("삭제 버튼을 탭하면 삭제 확인 다이얼로그가 열린다", async () => {
    render(<TodoStatusSheet todo={mockTodo} />);

    await userEvent.click(
      screen.getByRole("button", { name: `todo-${mockTodo.id}` }),
    );
    await userEvent.click(screen.getByRole("button", { name: "삭제" }));

    expect(
      screen.getByRole("heading", { name: "해야할 일 삭제" }),
    ).toBeInTheDocument();
  });

  test("삭제 확인 다이얼로그에 삭제 확인 메시지가 보인다", async () => {
    render(<TodoStatusSheet todo={mockTodo} />);

    await userEvent.click(
      screen.getByRole("button", { name: `todo-${mockTodo.id}` }),
    );
    await userEvent.click(screen.getByRole("button", { name: "삭제" }));

    expect(
      screen.getByText(`${mockTodo.title}을 삭제하시겠습니까?`),
    ).toBeInTheDocument();
  });

  test("삭제 확인 다이얼로그에 타이틀과 취소·삭제 버튼이 보인다", async () => {
    render(<TodoStatusSheet todo={mockTodo} />);

    await userEvent.click(
      screen.getByRole("button", { name: `todo-${mockTodo.id}` }),
    );
    await userEvent.click(screen.getByRole("button", { name: "삭제" }));

    expect(
      screen.getByRole("heading", { name: "해야할 일 삭제" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "삭제" })).toBeInTheDocument();
  });

  test("삭제 버튼을 탭하면 onDelete 콜백이 todo id와 함께 호출된다", async () => {
    const onDelete = vi.fn();
    render(<TodoStatusSheet todo={mockTodo} onDelete={onDelete} />);

    await userEvent.click(
      screen.getByRole("button", { name: `todo-${mockTodo.id}` }),
    );
    await userEvent.click(screen.getByRole("button", { name: "삭제" }));
    await userEvent.click(screen.getByRole("button", { name: "삭제" }));

    expect(onDelete).toHaveBeenCalledWith(mockTodo.id);
  });
});
