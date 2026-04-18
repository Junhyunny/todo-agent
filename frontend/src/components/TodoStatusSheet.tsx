import { Circle } from "lucide-react";
import { useState } from "react";
import type { TodoResponse } from "@/api/generated/agents.ts";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet.tsx";

type Props = {
  todo: TodoResponse;
};

export const TodoStatusSheet = ({ todo }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        nativeButton={false}
        render={<section aria-label={`todo-${todo.id}`} />}
      >
        <span>{todo.title}</span>
        <Circle aria-label="대기 중" className="text-gray-400" />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>해야할 일</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 p-4">
          <input
            aria-label="제목"
            disabled
            value={todo.title}
            className="w-full rounded border px-3 py-2"
          />
          <textarea
            aria-label="내용"
            disabled
            value={todo.content}
            className="w-full rounded border px-3 py-2"
          />
          <div className="flex items-center gap-2">
            <Circle
              aria-label="에이전트 할당 대기 아이콘"
              className="text-gray-400"
            />
            <span>에이전트 할당 대기</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
