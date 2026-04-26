import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { TodoStatus } from "@/types/enums.ts";
import { TodoStatusItem } from "./TodoStatusItem.tsx";

type Props = {
  failureReason?: string | null;
  onReassign?: () => void;
};

export const AgentReassignDialog = ({ failureReason, onReassign }: Props) => {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            aria-label="에이전트 재할당"
            className="flex items-center gap-2"
            type="button"
          />
        }
      >
        <TodoStatusItem
          status={TodoStatus.FAILED}
          message="에이전트 할당 실패"
        />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>에이전트 다시 할당</DialogTitle>
        </DialogHeader>
        {failureReason && <p>{failureReason}</p>}
        <p>재할당 하시겠습니까?</p>
        <DialogClose render={<Button />} onClick={onReassign}>
          확인
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
