import { CircleHelp, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import type { AgentResponse } from "@/api/generated/agents.ts";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
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
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
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
      setSelectedTools([]);
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
        <div className="flex items-center gap-1">
          <Label htmlFor="agent-edit-describe">설명</Label>
          <Tooltip>
            <TooltipTrigger aria-label="설명 도움말" closeOnClick={false}>
              <CircleHelp size={16} />
            </TooltipTrigger>
            <TooltipContent>
              에이전트가 어떤 키워드에 실행되는지, 어떤 동작을 수행할지 간략히
              적어주세요.
            </TooltipContent>
          </Tooltip>
        </div>
        <Textarea
          id="agent-edit-describe"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex items-center gap-1">
          <Label htmlFor="agent-edit-system-prompt">시스템 프롬프트</Label>
          <Tooltip>
            <TooltipTrigger
              aria-label="시스템 프롬프트 도움말"
              closeOnClick={false}
            >
              <CircleHelp size={16} />
            </TooltipTrigger>
            <TooltipContent>
              에이전트가 어떤 동작을 수행해야 할지 구체적으로 적어주세요.
            </TooltipContent>
          </Tooltip>
        </div>
        <Textarea
          id="agent-edit-system-prompt"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
        />
        <Label htmlFor="agent-edit-tools">도구 리스트</Label>
        <ToolListComboBox
          id="agent-edit-tools"
          value={selectedTools}
          onValueChange={setSelectedTools}
        />
        <DialogClose render={<Button />} onClick={() => void handleSave()}>
          저장
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
