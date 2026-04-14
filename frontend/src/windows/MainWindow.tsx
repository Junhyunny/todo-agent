import { Bot } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { AgentResponse } from "@/api/generated/agents.ts";
import { AgentRegistrationDialog } from "@/components/AgentRegistrationDialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { getAgents } from "@/repository/agent-repository.ts";

export const MainWindow = () => {
  const [agents, setAgents] = useState<AgentResponse[]>([]);

  const fetchAgents = useCallback(() => {
    getAgents().then(setAgents);
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return (
    <div>
      <AgentRegistrationDialog onClose={fetchAgents} />
      <Button aria-label="agent" variant="ghost" size="icon">
        <Bot role="img" aria-label="agent-icon" />
      </Button>
      {agents.map((agent) => (
        <div key={agent.id}>
          <h2>{agent.name}</h2>
        </div>
      ))}
    </div>
  );
};
