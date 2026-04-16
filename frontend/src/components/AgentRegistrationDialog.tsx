import { UserPlus } from "lucide-react";
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { createAgent } from "@/repository/agent-repository.ts";

export const AgentRegistrationDialog = () => {
  const [name, setName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [open, setOpen] = useState(false);

  const handleSave = async () => {
    await createAgent({ name, system_prompt: systemPrompt });
  };

  useEffect(() => {
    if (open) {
      setName("");
      setSystemPrompt("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button aria-label="에이전트 등록">
            <UserPlus />
          </Button>
        }
      />
      <DialogContent aria-label="agent-registration-dialog">
        <DialogHeader>
          <DialogTitle>에이전트 등록</DialogTitle>
        </DialogHeader>
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
        <DialogClose render={<Button />}>취소</DialogClose>
        <DialogClose render={<Button />} onClick={() => void handleSave()}>
          저장
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
