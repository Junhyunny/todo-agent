import { useMemo } from "react";
import type { TodoResponse } from "@/api/generated/agents.ts";
import { AgentReassignDialog } from "@/components/AgentReassignDialog.tsx";
import { AgentTaskResultDialog } from "@/components/AgentTaskResultDialog.tsx";
import { TodoStatusItem } from "@/components/TodoStatusItem.tsx";
import { TodoStatus } from "@/types/enums.ts";

type Props = {
  todo: TodoResponse;
  onReassign: (todoId: string) => void;
};

const statusMessage = (todo: TodoResponse) => {
  switch (todo.status) {
    case TodoStatus.FAILED:
      return "에이전트 할당 실패";
    case TodoStatus.ASSIGNED:
      return `${todo.assigned_agent_name} 에이전트 작업 중`;
    default:
      return "에이전트 할당 대기";
  }
};

export const TodoStatusSection = ({ todo, onReassign }: Props) => {
  const Component = useMemo(() => {
    switch (todo.status) {
      case TodoStatus.COMPLETED:
        return (
          <AgentTaskResultDialog status={todo.status} result={todo.result} />
        );
      case TodoStatus.FAILED:
        return (
          <AgentReassignDialog
            failureReason={todo.result}
            onReassign={() => onReassign(todo.id)}
          />
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <TodoStatusItem
              status={todo.status}
              message={statusMessage(todo)}
            />
          </div>
        );
    }
  }, [todo, onReassign]);

  return (
    <div role="note" aria-label="status-section">
      {Component}
    </div>
  );
};
