import { CirclePlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { createTodo } from "@/repository/todo-repository.ts";

type Props = {
  onSave?: (todoId: string) => void;
};

export const TodoRegistrationDialog = ({ onSave }: Props) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (open) {
      setTitle("");
      setContent("");
    }
  }, [open]);

  const handleSave = () => {
    createTodo({ title, content }).then((todo) => {
      setOpen(false);
      onSave?.(todo.id);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button aria-label="TODO 등록">
            <CirclePlus />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>해야할 일</DialogTitle>
        </DialogHeader>
        <Input
          type="text"
          aria-label="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          aria-label="내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button disabled={!title || !content} onClick={handleSave}>
          저장
        </Button>
      </DialogContent>
    </Dialog>
  );
};
