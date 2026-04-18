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
          <SheetTitle>{todo.title}</SheetTitle>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};
