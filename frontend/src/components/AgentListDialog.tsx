import { Bot, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { AgentResponse } from "@/api/generated/agents.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { getAgents } from "@/repository/agent-repository.ts";
import { AgentEditDialog } from "@/components/AgentEditDialog.tsx";

export const AgentListDialog = () => {
  const [agents, setAgents] = useState<AgentResponse[]>([]);

  const fetchAgents = useCallback(() => {
    getAgents().then(setAgents);
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return (
    <Dialog>
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
              <AgentEditDialog agent={agent} />
              <Button aria-label="삭제" variant="ghost" size="icon">
                <Trash2 />
              </Button>
            </div>
          </section>
        ))}
        <DialogClose render={<Button variant="outline" />}>이전</DialogClose>
      </DialogContent>
    </Dialog>
  );
};
