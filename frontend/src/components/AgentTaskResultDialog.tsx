import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { TodoStatusItem } from "./TodoStatusItem.tsx";

type Props = {
  status: string;
  result?: string | null;
};

export const AgentTaskResultDialog = ({ status, result }: Props) => {
  return (
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
        <TodoStatusItem status={status} message="작업 완료" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>작업 결과</DialogTitle>
        </DialogHeader>
        <p>{result}</p>
        <DialogClose render={<Button variant="outline" />}>닫기</DialogClose>
      </DialogContent>
    </Dialog>
  );
};
