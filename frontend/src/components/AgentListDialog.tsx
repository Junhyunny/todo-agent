import { Bot } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { AgentResponse } from "@/api/generated/agents.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { getAgents } from "@/repository/agent-repository.ts";

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
      <DialogContent>
        {agents.map((agent) => (
          <div key={agent.id}>
            <h2>{agent.name}</h2>
          </div>
        ))}
      </DialogContent>
    </Dialog>
  );
};
