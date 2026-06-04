import { Trash2 } from "lucide-react";
import { useState } from "react";
import type { AgentResponse } from "@/api/generated/agents.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { deleteAgent } from "@/repository/agent-repository.ts";

export const AgentDeleteDialog = ({
  agent,
  onDelete,
}: {
  agent: AgentResponse;
  onDelete: () => void;
}) => {
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    deleteAgent(agent.id).then(() => {
      setOpen(false);
      onDelete();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button aria-label="삭제" variant="ghost" size="icon">
            <Trash2 />
          </Button>
        }
      />
      <DialogContent>
        <p className="text-sm text-muted-foreground">삭제하겠습니까?</p>
        <div className="flex justify-end">
          <Button variant="destructive" onClick={handleDelete}>
            삭제
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
