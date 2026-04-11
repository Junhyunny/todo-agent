// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";

export const AgentRegistrationWindow = () => {
  return (
    <div>
      <input type="text" aria-label="에이전트 이름" />
      <textarea aria-label="시스템 프롬프트" />
      <button type="button">취소</button>
      <button type="button">저장</button>
    </div>
  );
};
