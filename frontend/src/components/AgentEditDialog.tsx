import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import type { AgentResponse } from "@/api/generated/agents.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { updateAgent } from "@/repository/agent-repository.ts";

export const AgentEditDialog = ({
  agent,
  onSave,
}: {
  agent: AgentResponse;
  onSave: () => void;
}) => {
  const [name, setName] = useState(agent.name);
  const [systemPrompt, setSystemPrompt] = useState(agent.system_prompt);
  const [open, setOpen] = useState(false);

  const handleSave = async () => {
    await updateAgent(agent.id, { name, system_prompt: systemPrompt });
    onSave();
  };

  useEffect(() => {
    if (open) {
      setName(agent.name);
      setSystemPrompt(agent.system_prompt);
    }
  }, [open, agent]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button aria-label="수정" variant="ghost" size="icon">
            <Pencil />
          </Button>
        }
      />
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>에이전트 수정</DialogTitle>
        </DialogHeader>
        <input
          type="text"
          aria-label="에이전트 이름"
          value={name}
          disabled
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          aria-label="시스템 프롬프트"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
        />
        <DialogClose render={<Button variant="outline" />}>취소</DialogClose>
        <DialogClose render={<Button />} onClick={() => void handleSave()}>
          저장
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
