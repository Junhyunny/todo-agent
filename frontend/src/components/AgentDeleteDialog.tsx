import { Trash2 } from "lucide-react";
import type { AgentResponse } from "@/api/generated/agents.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";

// biome-ignore lint/correctness/noUnusedFunctionParameters: will be used when delete is implemented
export const AgentDeleteDialog = ({ agent }: { agent: AgentResponse }) => {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button aria-label="삭제" variant="ghost" size="icon">
            <Trash2 />
          </Button>
        }
      />
      <DialogContent showCloseButton={false}>
        <p>삭제하겠습니까?</p>
        <DialogClose render={<Button variant="outline" />}>취소</DialogClose>
        <Button variant="destructive">삭제</Button>
      </DialogContent>
    </Dialog>
  );
};
