import { UserPlus } from "lucide-react";
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React, { useState } from "react";
import {
  DESCRIPTION_TOOLTIP,
  LabelWithTooltip,
  SYSTEM_PROMPT_TOOLTIP,
} from "@/components/LabelWithTooltip.tsx";
import { ToolListComboBox } from "@/components/ToolListComboBox.tsx";
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
import { useAgentForm } from "@/hooks/useAgentForm.ts";
import { useDuplicateAgentName } from "@/hooks/useDuplicateAgentName.ts";

export const AgentRegistrationDialog = () => {
  const [open, setOpen] = useState(false);
  const {
    name,
    description,
    systemPrompt,
    selectedTools,
    setName,
    setDescription,
    setSystemPrompt,
    setSelectedTools,
    isComplete,
    submit,
  } = useAgentForm({ open });
  const isDuplicate = useDuplicateAgentName(name);

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
        <div className="grid gap-2">
          <Label htmlFor="agent-name">에이전트 이름</Label>
          <Input
            type="text"
            id="agent-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {isDuplicate && (
            <p className="text-sm text-destructive">
              동일한 이름의 에이전트가 존재합니다.
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <LabelWithTooltip
            htmlFor="agent-describe"
            label="설명"
            tooltipLabel="설명 도움말"
            tooltipContent={DESCRIPTION_TOOLTIP}
          />
          <Textarea
            id="agent-describe"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <LabelWithTooltip
            htmlFor="agent-system-prompt"
            label="시스템 프롬프트"
            tooltipLabel="시스템 프롬프트 도움말"
            tooltipContent={SYSTEM_PROMPT_TOOLTIP}
          />
          <Textarea
            id="agent-system-prompt"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="agent-tools">도구 리스트</Label>
          <ToolListComboBox
            id="agent-tools"
            value={selectedTools}
            onValueChange={setSelectedTools}
          />
        </div>
        <DialogClose
          render={<Button disabled={!isComplete || isDuplicate} />}
          onClick={() => void submit()}
        >
          저장
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
