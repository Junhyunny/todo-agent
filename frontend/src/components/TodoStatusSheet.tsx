import { useState } from "react";
import type { TodoResponse } from "@/api/generated/agents.ts";
import { AgentTaskResultDialog } from "@/components/AgentTaskResultDialog.tsx";
import { TodoDeleteDialog } from "@/components/TodoDeleteDialog.tsx";
import { TodoStatusSection } from "@/components/TodoStatusSection.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { TodoStatus } from "@/types/enums.ts";

type Props = {
  todo: TodoResponse;
  onDelete?: (todoId: string) => void;
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

export const TodoStatusSheet = ({ todo, onDelete }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        nativeButton={false}
        render={<section aria-label={`todo-${todo.id}`} />}
      >
        <span>{todo.title}</span>
        <TodoStatusSection status={todo.status} />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>해야할 일</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 p-4">
          <Input aria-label="제목" disabled value={todo.title} />
          <Textarea aria-label="내용" disabled value={todo.content} />
          <div role="note" aria-label="status-section">
            {todo.status === TodoStatus.COMPLETED ? (
              <AgentTaskResultDialog
                status={todo.status}
                result={todo.result}
              />
            ) : (
              <div className="flex items-center gap-2">
                <TodoStatusSection
                  status={todo.status}
                  message={statusMessage(todo)}
                />
              </div>
            )}
          </div>
        </div>
        <TodoDeleteDialog
          message={`${todo.title}을 삭제하시겠습니까?`}
          onConfirm={() => {
            setOpen(false);
            onDelete?.(todo.id);
          }}
        />
      </SheetContent>
    </Sheet>
  );
};
