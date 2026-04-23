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
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import {
  createAgent,
  existsAgentByName,
} from "@/repository/agent-repository.ts";

export const AgentRegistrationDialog = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [open, setOpen] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const handleSave = async () => {
    await createAgent({ name, system_prompt: systemPrompt });
  };

  useEffect(() => {
    if (!name) {
      setIsDuplicate(false);
      return;
    }
    existsAgentByName(name).then(setIsDuplicate);
  }, [name]);

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setSystemPrompt("");
      setIsDuplicate(false);
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
        <Label htmlFor="agent-name">에이전트 이름</Label>
        <Input
          type="text"
          id="agent-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {isDuplicate && <p>동일한 이름의 에이전트가 존재합니다.</p>}
        <Label htmlFor="agent-describe">설명</Label>
        <Textarea
          id="agent-describe"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Label htmlFor="agent-system-prompt">시스템 프롬프트</Label>
        <Textarea
          id="agent-system-prompt"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
        />
        <DialogClose
          render={<Button disabled={!name || !systemPrompt || isDuplicate} />}
          onClick={() => void handleSave()}
        >
          저장
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
