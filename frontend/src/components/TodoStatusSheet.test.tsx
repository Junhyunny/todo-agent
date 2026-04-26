import { render, screen, within } from "@testing-library/react";
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
  status: "assigned",
};

const mockCompletedTodo = {
  ...mockTodo,
  assigned_agent_name: "검색 에이전트",
  status: "completed",
  result: "작업 결과입니다",
};

const mockFailedTodo = {
  ...mockTodo,
  status: "failed",
};

const mockFailedTodoWithReason = {
  ...mockTodo,
  status: "failed",
  result: "적합한 에이전트를 찾지 못했습니다",
};

describe("TodoStatusSheet", () => {
  describe("시트가 열리기 전 버튼 상태", () => {
    test("에이전트가 할당된 TODO 항목에는 spinner 아이콘이 보인다", () => {
      render(
        <TodoStatusSheet
          onReassign={vi.fn()}
          onDelete={vi.fn()}
          todo={mockAssignedTodo}
        />,
      );

      expect(screen.getByLabelText("에이전트 작업 중")).toBeInTheDocument();
    });

    test("작업이 완료된 TODO 항목에는 초록 체크박스 아이콘이 보인다", () => {
      render(
        <TodoStatusSheet
          onReassign={vi.fn()}
          onDelete={vi.fn()}
          todo={mockCompletedTodo}
        />,
      );

      expect(screen.getByLabelText("작업 완료")).toBeInTheDocument();
    });

    test("할당 실패 TODO에는 X 아이콘이 보인다", () => {
      render(
        <TodoStatusSheet
          onReassign={vi.fn()}
          onDelete={vi.fn()}
          todo={mockFailedTodo}
        />,
      );

      expect(screen.getByLabelText("에이전트 할당 실패")).toBeInTheDocument();
    });

    test("할당 성공 TODO에는 X 아이콘이 보이지 않는다", () => {
      render(
        <TodoStatusSheet
          onReassign={vi.fn()}
          onDelete={vi.fn()}
          todo={mockTodo}
        />,
      );

      expect(
        screen.queryByLabelText("에이전트 할당 실패"),
      ).not.toBeInTheDocument();
    });
  });

  describe("시트가 열린 후", () => {
    test("TODO 항목을 탭하면 상태 시트가 열린다", async () => {
      render(
        <TodoStatusSheet
          onReassign={vi.fn()}
          onDelete={vi.fn()}
          todo={mockTodo}
        />,
      );

      await userEvent.click(
        screen.getByRole("button", { name: `todo-${mockTodo.id}` }),
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    test("시트가 열리면 '해야할 일' 타이틀이 보인다", async () => {
      render(
        <TodoStatusSheet
          onReassign={vi.fn()}
          onDelete={vi.fn()}
          todo={mockTodo}
        />,
      );

      await userEvent.click(
        screen.getByRole("button", { name: `todo-${mockTodo.id}` }),
      );

      expect(
        screen.getByRole("heading", { name: "해야할 일" }),
      ).toBeInTheDocument();
    });

    test("시트가 열리면 제목 필드가 비활성화 상태로 보인다", async () => {
      render(
        <TodoStatusSheet
          onReassign={vi.fn()}
          onDelete={vi.fn()}
          todo={mockTodo}
        />,
      );

      await userEvent.click(
        screen.getByRole("button", { name: `todo-${mockTodo.id}` }),
      );

      expect(screen.getByRole("textbox", { name: "제목" })).toBeDisabled();
    });

    test("시트가 열리면 내용 필드가 비활성화 상태로 보인다", async () => {
      render(
        <TodoStatusSheet
          onReassign={vi.fn()}
          onDelete={vi.fn()}
          todo={mockTodo}
        />,
      );

      await userEvent.click(
        screen.getByRole("button", { name: `todo-${mockTodo.id}` }),
      );

      expect(screen.getByRole("textbox", { name: "내용" })).toBeDisabled();
    });

    test("에이전트가 할당되지 않은 경우 할당 대기 아이콘과 메시지가 보인다", async () => {
      render(
        <TodoStatusSheet
          onReassign={vi.fn()}
          onDelete={vi.fn()}
          todo={mockTodo}
        />,
      );

      await userEvent.click(
        screen.getByRole("button", { name: `todo-${mockTodo.id}` }),
      );

      const statusSection = screen.getByLabelText("status-section");
      expect(
        within(statusSection).getByLabelText("에이전트 할당 대기"),
      ).toBeInTheDocument();
      expect(screen.getByText("에이전트 할당 대기")).toBeInTheDocument();
    });

    test("에이전트가 작업 중인 경우 spinner 아이콘과 작업 중 메시지가 보인다", async () => {
      render(
        <TodoStatusSheet
          onReassign={vi.fn()}
          onDelete={vi.fn()}
          todo={mockAssignedTodo}
        />,
      );

      await userEvent.click(
        screen.getByRole("button", { name: `todo-${mockAssignedTodo.id}` }),
      );

      const statusSection = screen.getByLabelText("status-section");
      expect(
        within(statusSection).getByLabelText("에이전트 작업 중"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("검색 에이전트 에이전트 작업 중"),
      ).toBeInTheDocument();
    });

    test("작업이 완료된 경우 완료 아이콘과 메시지가 보인다", async () => {
      render(
        <TodoStatusSheet
          onReassign={vi.fn()}
          onDelete={vi.fn()}
          todo={mockCompletedTodo}
        />,
      );

      await userEvent.click(
        screen.getByRole("button", { name: `todo-${mockCompletedTodo.id}` }),
      );

      const statusSection = screen.getByLabelText("status-section");
      expect(
        within(statusSection).getByLabelText("작업 완료"),
      ).toBeInTheDocument();
      expect(screen.getByText("작업 완료")).toBeInTheDocument();
    });

    test("작업 완료 영역을 탭하면 작업 결과 다이얼로그가 열린다", async () => {
      render(
        <TodoStatusSheet
          onReassign={vi.fn()}
          onDelete={vi.fn()}
          todo={mockCompletedTodo}
        />,
      );

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
      render(
        <TodoStatusSheet
          onReassign={vi.fn()}
          onDelete={vi.fn()}
          todo={mockCompletedTodo}
        />,
      );

      await userEvent.click(
        screen.getByRole("button", { name: `todo-${mockCompletedTodo.id}` }),
      );
      await userEvent.click(
        screen.getByRole("button", { name: "작업 결과 보기" }),
      );

      expect(screen.getByText("작업 결과입니다")).toBeInTheDocument();
    });

    test("작업 결과 다이얼로그에 닫기 버튼이 있다", async () => {
      render(
        <TodoStatusSheet
          onReassign={vi.fn()}
          onDelete={vi.fn()}
          todo={mockCompletedTodo}
        />,
      );

      await userEvent.click(
        screen.getByRole("button", { name: `todo-${mockCompletedTodo.id}` }),
      );
      await userEvent.click(
        screen.getByRole("button", { name: "작업 결과 보기" }),
      );

      expect(screen.getByRole("button", { name: "닫기" })).toBeInTheDocument();
    });

    test("할당 실패 영역을 탭하면 에이전트 재할당 다이얼로그가 열린다", async () => {
      render(
        <TodoStatusSheet
          onReassign={vi.fn()}
          onDelete={vi.fn()}
          todo={mockFailedTodo}
        />,
      );

      await userEvent.click(
        screen.getByRole("button", { name: `todo-${mockFailedTodo.id}` }),
      );
      await userEvent.click(
        screen.getByRole("button", { name: "에이전트 재할당" }),
      );

      expect(
        screen.getByRole("heading", { name: "에이전트 다시 할당" }),
      ).toBeInTheDocument();
    });

    test("에이전트 재할당 다이얼로그에서 확인 버튼을 클릭하면 onReassign 콜백이 todo id와 함께 호출된다", async () => {
      const onReassign = vi.fn();
      render(
        <TodoStatusSheet
          onReassign={onReassign}
          todo={mockFailedTodo}
          onDelete={vi.fn()}
        />,
      );

      await userEvent.click(
        screen.getByRole("button", { name: `todo-${mockFailedTodo.id}` }),
      );
      await userEvent.click(
        screen.getByRole("button", { name: "에이전트 재할당" }),
      );
      await userEvent.click(
        within(screen.getByRole("dialog")).getByRole("button", {
          name: "확인",
        }),
      );

      expect(onReassign).toHaveBeenCalledWith(mockFailedTodo.id);
    });

    test("에이전트 재할당 다이얼로그에 할당 실패 이유가 보인다", async () => {
      render(
        <TodoStatusSheet
          onReassign={vi.fn()}
          onDelete={vi.fn()}
          todo={mockFailedTodoWithReason}
        />,
      );

      await userEvent.click(
        screen.getByRole("button", {
          name: `todo-${mockFailedTodoWithReason.id}`,
        }),
      );
      await userEvent.click(
        screen.getByRole("button", { name: "에이전트 재할당" }),
      );

      expect(
        screen.getByText("적합한 에이전트를 찾지 못했습니다"),
      ).toBeInTheDocument();
    });

    test("할당 실패 상태에서 실패 아이콘과 메시지가 보인다", async () => {
      render(
        <TodoStatusSheet
          onReassign={vi.fn()}
          onDelete={vi.fn()}
          todo={mockFailedTodo}
        />,
      );

      await userEvent.click(
        screen.getByRole("button", { name: `todo-${mockFailedTodo.id}` }),
      );

      const statusSection = screen.getByLabelText("status-section");
      expect(
        within(statusSection).getByLabelText("에이전트 할당 실패"),
      ).toBeInTheDocument();
      expect(screen.getByText("에이전트 할당 실패")).toBeInTheDocument();
    });
  });

  describe("삭제", () => {
    test("시트가 열리면 삭제 버튼이 보인다", async () => {
      render(
        <TodoStatusSheet
          onReassign={vi.fn()}
          onDelete={vi.fn()}
          todo={mockTodo}
        />,
      );

      await userEvent.click(
        screen.getByRole("button", { name: `todo-${mockTodo.id}` }),
      );

      expect(screen.getByRole("button", { name: "삭제" })).toBeInTheDocument();
    });

    test("삭제 버튼을 탭하면 삭제 확인 다이얼로그가 열린다", async () => {
      render(
        <TodoStatusSheet
          onReassign={vi.fn()}
          onDelete={vi.fn()}
          todo={mockTodo}
        />,
      );

      await userEvent.click(
        screen.getByRole("button", { name: `todo-${mockTodo.id}` }),
      );
      await userEvent.click(screen.getByRole("button", { name: "삭제" }));

      expect(
        screen.getByRole("heading", { name: "해야할 일 삭제" }),
      ).toBeInTheDocument();
    });

    test("삭제 확인 다이얼로그에 삭제 확인 메시지가 보인다", async () => {
      render(
        <TodoStatusSheet
          onReassign={vi.fn()}
          onDelete={vi.fn()}
          todo={mockTodo}
        />,
      );

      await userEvent.click(
        screen.getByRole("button", { name: `todo-${mockTodo.id}` }),
      );
      await userEvent.click(screen.getByRole("button", { name: "삭제" }));

      expect(
        screen.getByText(`${mockTodo.title}을 삭제하시겠습니까?`),
      ).toBeInTheDocument();
    });

    test("삭제 확인 다이얼로그에 타이틀과 취소·삭제 버튼이 보인다", async () => {
      render(
        <TodoStatusSheet
          onReassign={vi.fn()}
          onDelete={vi.fn()}
          todo={mockTodo}
        />,
      );

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
      render(
        <TodoStatusSheet
          onReassign={vi.fn()}
          onDelete={onDelete}
          todo={mockTodo}
        />,
      );

      await userEvent.click(
        screen.getByRole("button", { name: `todo-${mockTodo.id}` }),
      );
      await userEvent.click(screen.getByRole("button", { name: "삭제" }));
      await userEvent.click(screen.getByRole("button", { name: "삭제" }));

      expect(onDelete).toHaveBeenCalledWith(mockTodo.id);
    });

    test("삭제 확인 버튼을 탭하면 시트가 닫힌다", async () => {
      render(
        <TodoStatusSheet
          onReassign={vi.fn()}
          onDelete={vi.fn()}
          todo={mockTodo}
        />,
      );

      await userEvent.click(
        screen.getByRole("button", { name: `todo-${mockTodo.id}` }),
      );
      await userEvent.click(screen.getByRole("button", { name: "삭제" }));
      await userEvent.click(screen.getByRole("button", { name: "삭제" }));

      expect(
        screen.queryByRole("heading", { name: "해야할 일" }),
      ).not.toBeInTheDocument();
    });
  });
});
