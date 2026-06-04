import { useEffect, useState } from "react";
import type { AgentResponse } from "@/api/generated/agents.ts";
import { createAgent, updateAgent } from "@/repository/agent-repository.ts";

type UseAgentFormParams = {
  open: boolean;
  agent?: AgentResponse;
  onSaved?: () => void;
};

type UseAgentFormResult = {
  name: string;
  description: string;
  systemPrompt: string;
  selectedTools: string[];
  setName: (value: string) => void;
  setDescription: (value: string) => void;
  setSystemPrompt: (value: string) => void;
  setSelectedTools: (value: string[]) => void;
  isComplete: boolean;
  submit: () => Promise<void>;
};

/**
 * 에이전트 등록/수정 폼의 값과 제출을 관리한다.
 * `agent`가 있으면 수정 모드(초기값 prefill + updateAgent), 없으면 생성 모드
 * (빈 값 + createAgent)로 동작한다. 다이얼로그가 열릴 때(`open`) 폼 값을
 * 모드에 맞는 기본값으로 초기화한다.
 */
export const useAgentForm = ({
  open,
  agent,
  onSaved,
}: UseAgentFormParams): UseAgentFormResult => {
  const [name, setName] = useState(agent?.name ?? "");
  const [description, setDescription] = useState(agent?.description ?? "");
  const [systemPrompt, setSystemPrompt] = useState(agent?.system_prompt ?? "");
  const [selectedTools, setSelectedTools] = useState<string[]>(
    agent?.tools ?? [],
  );

  useEffect(() => {
    if (open) {
      setName(agent?.name ?? "");
      setDescription(agent?.description ?? "");
      setSystemPrompt(agent?.system_prompt ?? "");
      setSelectedTools(agent?.tools ?? []);
    }
  }, [open, agent]);

  const isComplete = !!name && !!description && !!systemPrompt;

  const submit = async (): Promise<void> => {
    const request = {
      name,
      description,
      system_prompt: systemPrompt,
      tools: selectedTools,
    };
    if (agent) {
      await updateAgent(agent.id, request);
      onSaved?.();
    } else {
      await createAgent(request);
    }
  };

  return {
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
  };
};
