import { useState } from "react";
import type { TodoResponse } from "@/api/generated/agents.ts";
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
import { TodoStatusItem } from "./TodoStatusItem.tsx";

type Props = {
  todo: TodoResponse;
  onDelete: (todoId: string) => void;
  onReassign: (todoId: string) => void;
};

export const TodoStatusSheet = ({ todo, onDelete, onReassign }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        nativeButton={false}
        render={<section aria-label={`todo-${todo.id}`} />}
      >
        <span>{todo.title}</span>
        <TodoStatusItem status={todo.status} />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>해야할 일</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 p-4">
          <Input aria-label="제목" disabled value={todo.title} />
          <Textarea aria-label="내용" disabled value={todo.content} />
          <TodoStatusSection todo={todo} onReassign={onReassign} />
        </div>
        <TodoDeleteDialog
          message={`${todo.title}을 삭제하시겠습니까?`}
          onConfirm={() => {
            setOpen(false);
            onDelete(todo.id);
          }}
        />
      </SheetContent>
    </Sheet>
  );
};
