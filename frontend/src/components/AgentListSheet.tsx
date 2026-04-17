import { Bot } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { AgentResponse } from "@/api/generated/agents.ts";
import { AgentDeleteDialog } from "@/components/AgentDeleteDialog.tsx";
import { AgentEditDialog } from "@/components/AgentEditDialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet.tsx";
import { getAgents } from "@/repository/agent-repository.ts";

export const AgentListSheet = () => {
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button aria-label="agent" variant="ghost" size="icon">
            <Bot role="img" aria-label="agent-icon" />
          </Button>
        }
      />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>에이전트 목록</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          {agents.map((agent) => (
            <section
              key={agent.id}
              aria-label={`agent-${agent.id}`}
              className="flex items-center justify-between"
            >
              <h2>{agent.name}</h2>
              <div className="flex gap-2">
                <AgentEditDialog agent={agent} onSave={fetchAgents} />
                <AgentDeleteDialog agent={agent} onDelete={fetchAgents} />
              </div>
            </section>
          ))}
        </div>
        <SheetClose render={<Button variant="outline" />}>이전</SheetClose>
      </SheetContent>
    </Sheet>
  );
};
