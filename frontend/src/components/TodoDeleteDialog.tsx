import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";

type Props = {
  message: string;
  onConfirm: () => void;
};

export const TodoDeleteDialog = ({ message, onConfirm }: Props) => {
  return (
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
        <p>{message}</p>
        <div className="flex justify-end gap-2">
          <DialogClose render={<Button variant="outline" />}>취소</DialogClose>
          <DialogClose render={<Button />} onClick={onConfirm}>
            삭제
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
