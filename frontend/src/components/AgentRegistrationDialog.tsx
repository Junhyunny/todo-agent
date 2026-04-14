// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { createAgent } from "@/repository/agent-repository.ts";

type Props = {
  onClose: () => void;
};

export const AgentRegistrationDialog = ({ onClose }: Props) => {
  const [name, setName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");

  const handleSave = async () => {
    await createAgent({ name, system_prompt: systemPrompt });
    onClose();
  };

  return (
    <Dialog>
      <DialogTrigger>+</DialogTrigger>
      <DialogContent aria-label="agent-registration-dialog">
        <input
          type="text"
          aria-label="에이전트 이름"
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          aria-label="시스템 프롬프트"
          onChange={(e) => setSystemPrompt(e.target.value)}
        />
        <DialogClose render={<button type="button" />}>취소</DialogClose>
        <DialogClose
          render={<button type="button" />}
          onClick={() => {
            void handleSave();
          }}
        >
          저장
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
