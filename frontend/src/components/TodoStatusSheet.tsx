import { Circle, CircleCheck, LoaderCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import type { TodoResponse } from "@/api/generated/agents.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";

type Props = {
  todo: TodoResponse;
  onDelete?: (todoId: string) => void;
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
        {todo.status === "completed" ? (
          <CircleCheck aria-label="작업 완료" className="text-green-500" />
        ) : todo.assigned_agent_name ? (
          <LoaderCircle
            aria-label="작업 중"
            className="animate-spin text-blue-500"
          />
        ) : (
          <Circle aria-label="대기 중" className="text-gray-400" />
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>해야할 일</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 p-4">
          <Input aria-label="제목" disabled value={todo.title} />
          <Textarea aria-label="내용" disabled value={todo.content} />
          {todo.status === "completed" ? (
            <Dialog>
              <DialogTrigger
                render={
                  <button
                    aria-label="작업 결과 보기"
                    className="flex items-center gap-2"
                    type="button"
                  />
                }
              >
                <CircleCheck
                  aria-label="작업 완료 아이콘"
                  className="text-green-500"
                />
                <span>작업 완료</span>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>작업 결과</DialogTitle>
                </DialogHeader>
                <p>{todo.result}</p>
                <DialogClose render={<Button variant="outline" />}>
                  닫기
                </DialogClose>
              </DialogContent>
            </Dialog>
          ) : todo.assigned_agent_name ? (
            <div className="flex items-center gap-2">
              <LoaderCircle
                aria-label="에이전트 작업 중 아이콘"
                className="animate-spin"
              />
              <span>{todo.assigned_agent_name} 에이전트 작업 중</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Circle
                aria-label="에이전트 할당 대기 아이콘"
                className="text-gray-400"
              />
              <span>에이전트 할당 대기</span>
            </div>
          )}
        </div>
        <Dialog>
          <DialogTrigger
            render={<Button variant="ghost" size="icon" aria-label="삭제" />}
          >
            <Trash2 />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>해야할 일 삭제</DialogTitle>
            </DialogHeader>
            <p>{todo.title}을 삭제하시겠습니까?</p>
            <div className="flex justify-end gap-2">
              <DialogClose render={<Button variant="outline" />}>
                취소
              </DialogClose>
              <DialogClose
                render={<Button />}
                onClick={() => {
                  setOpen(false);
                  onDelete?.(todo.id);
                }}
              >
                삭제
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
};
