// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React, { useState } from "react";
import { createAgent } from "@/repository/agent-repository.ts";

export const AgentRegistrationWindow = () => {
  const [name, setName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");

  const closeWindow = () => {
    window.agentRegistration?.close();
  };

  const handleCreate = async () => {
    await createAgent({ name, system_prompt: systemPrompt });
  };

  return (
    <div>
      <input
        type="text"
        aria-label="에이전트 이름"
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        aria-label="시스템 프롬프트"
        onChange={(e) => setSystemPrompt(e.target.value)}
      />
      <button type="button" onClick={closeWindow}>
        취소
      </button>
      <button
        type="button"
        onClick={() => {
          void handleCreate();
          closeWindow();
        }}
      >
        저장
      </button>
    </div>
  );
};
