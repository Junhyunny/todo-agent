import { Pencil } from "lucide-react";
import { useState } from "react";
import type { AgentResponse } from "@/api/generated/agents.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";

export const AgentEditDialog = ({ agent }: { agent: AgentResponse }) => {
  const [name, setName] = useState(agent.name);
  const [systemPrompt, setSystemPrompt] = useState(agent.system_prompt);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button aria-label="수정" variant="ghost" size="icon">
            <Pencil />
          </Button>
        }
      />
      <DialogContent showCloseButton={false}>
        <input
          type="text"
          aria-label="에이전트 이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          aria-label="시스템 프롬프트"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
        />
        <DialogClose render={<Button variant="outline" />}>취소</DialogClose>
        <DialogClose render={<Button />}>저장</DialogClose>
      </DialogContent>
    </Dialog>
  );
};
