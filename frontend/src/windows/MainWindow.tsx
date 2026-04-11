import { Bot } from "lucide-react";
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
import { Button } from "@/components/ui/button.tsx";

export const MainWindow = () => {
  return (
    <div>
      <Button onClick={() => void window.agentRegistration.open()}>+</Button>
      <Button aria-label="agent" variant="ghost" size="icon">
        <Bot role="img" aria-label="agent-icon" />
      </Button>
    </div>
  );
};
