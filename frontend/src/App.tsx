import { Bot } from "lucide-react";
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
import { Button } from "@/components/ui/button.tsx";

export const App = () => (
  <div>
    <div className="flex items-center justify-end">
      <Button>+</Button>
      <Button aria-label="agent" variant="ghost" size="icon">
        <Bot role="img" aria-label="agent-icon" />
      </Button>
    </div>
  </div>
);
