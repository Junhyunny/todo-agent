import { Bot } from "lucide-react";
import React, { useEffect } from "react";
import type { AgentResponse } from "@/api/generated/agents.ts";
import { Button } from "@/components/ui/button.tsx";
import { getAgents } from "@/repository/agent-repository.ts";

export const MainWindow = () => {
  const [agents, setAgents] = React.useState<AgentResponse[]>([]);

  useEffect(() => {
    getAgents().then(setAgents);
  }, []);

  return (
    <div>
      <Button onClick={() => void window.agentRegistration.open()}>+</Button>
      <Button aria-label="agent" variant="ghost" size="icon">
        <Bot role="img" aria-label="agent-icon" />
      </Button>
      {agents.map((agent) => (
        <div key={agent.id}>
          <h2>{agent.name}</h2>
          <p>{agent.system_prompt}</p>
        </div>
      ))}
    </div>
  );
};
