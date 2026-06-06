import { Pencil } from "lucide-react";
import { useState } from "react";
import type { AgentResponse } from "@/api/generated/agents.ts";
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

export const AgentEditDialog = ({
  agent,
  onSave,
}: {
  agent: AgentResponse;
  onSave: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const {
    name,
    description,
    systemPrompt,
    selectedTools,
    setDescription,
    setSystemPrompt,
    setSelectedTools,
    isComplete,
    submit,
  } = useAgentForm({ open, agent, onSaved: onSave });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button aria-label="수정" variant="outline" size="icon">
            <Pencil />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>에이전트 수정</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="agent-edit-name">에이전트 이름</Label>
          <Input type="text" id="agent-edit-name" value={name} disabled />
        </div>
        <div className="grid gap-2">
          <LabelWithTooltip
            htmlFor="agent-edit-describe"
            label="설명"
            tooltipLabel="설명 도움말"
            tooltipContent={DESCRIPTION_TOOLTIP}
          />
          <Textarea
            id="agent-edit-describe"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <LabelWithTooltip
            htmlFor="agent-edit-system-prompt"
            label="시스템 프롬프트"
            tooltipLabel="시스템 프롬프트 도움말"
            tooltipContent={SYSTEM_PROMPT_TOOLTIP}
          />
          <Textarea
            id="agent-edit-system-prompt"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="agent-edit-tools">도구 리스트</Label>
          <ToolListComboBox
            id="agent-edit-tools"
            value={selectedTools}
            onValueChange={setSelectedTools}
          />
        </div>
        <DialogClose
          render={<Button disabled={!isComplete} />}
          onClick={() => void submit()}
        >
          저장
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
