import { Bot } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { AgentResponse } from "@/api/generated/agents.ts";
import { Button } from "@/components/ui/button.tsx";
import { Dialog, DialogContent } from "@/components/ui/dialog.tsx";
import { getAgents } from "@/repository/agent-repository.ts";
import { AgentRegistrationWindow } from "@/windows/AgentRegistrationWindow.tsx";

export const MainWindow = () => {
  const [agents, setAgents] = useState<AgentResponse[]>([]);

  useEffect(() => {
    getAgents().then(setAgents);
  }, []);

  return (
    <div>
      <AgentRegistrationWindow />
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
