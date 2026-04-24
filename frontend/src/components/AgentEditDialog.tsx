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
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { updateAgent } from "@/repository/agent-repository.ts";

export const AgentEditDialog = ({
  agent,
  onSave,
}: {
  agent: AgentResponse;
  onSave: () => void;
}) => {
  const [name, setName] = useState(agent.name);
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState(agent.system_prompt);
  const [open, setOpen] = useState(false);

  const handleSave = async () => {
    await updateAgent(agent.id, { name, system_prompt: systemPrompt });
    onSave();
  };

  useEffect(() => {
    if (open) {
      setName(agent.name);
      setDescription("");
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>에이전트 수정</DialogTitle>
        </DialogHeader>
        <Label htmlFor="agent-edit-name">에이전트 이름</Label>
        <Input
          type="text"
          id="agent-edit-name"
          value={name}
          disabled
          onChange={(e) => setName(e.target.value)}
        />
        <Label htmlFor="agent-edit-describe">설명</Label>
        <Textarea
          id="agent-edit-describe"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Label htmlFor="agent-edit-system-prompt">시스템 프롬프트</Label>
        <Textarea
          id="agent-edit-system-prompt"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
        />
        <DialogClose render={<Button />} onClick={() => void handleSave()}>
          저장
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
