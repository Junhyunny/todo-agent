import { Bot } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { AgentResponse } from "@/api/generated/agents.ts";
import { AgentDeleteDialog } from "@/components/AgentDeleteDialog.tsx";
import { AgentEditDialog } from "@/components/AgentEditDialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { getAgents } from "@/repository/agent-repository.ts";

export const AgentListDialog = () => {
  const [agents, setAgents] = useState<AgentResponse[]>([]);
  const [open, setOpen] = useState(false);

  const fetchAgents = useCallback(() => {
    getAgents().then(setAgents);
  }, []);

  useEffect(() => {
    if (open) {
      fetchAgents();
    }
  }, [fetchAgents, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button aria-label="agent" variant="ghost" size="icon">
            <Bot role="img" aria-label="agent-icon" />
          </Button>
        }
      />
      <DialogContent showCloseButton={false}>
        {agents.map((agent) => (
          <section
            key={agent.id}
            aria-label={`agent-${agent.id}`}
            className="flex items-center justify-between"
          >
            <div>
              <h2>{agent.name}</h2>
              <p>{agent.system_prompt}</p>
            </div>
            <div className="flex gap-2">
              <AgentEditDialog agent={agent} onSave={fetchAgents} />
              <AgentDeleteDialog agent={agent} onDelete={fetchAgents} />
            </div>
          </section>
        ))}
        <DialogClose render={<Button variant="outline" />}>이전</DialogClose>
      </DialogContent>
    </Dialog>
  );
};
