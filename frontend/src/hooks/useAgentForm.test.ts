import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { AgentResponse } from "@/api/generated/agents.ts";
import * as agentRepository from "@/repository/agent-repository.ts";
import { useAgentForm } from "./useAgentForm.ts";

const mockCreateAgent = vi.spyOn(agentRepository, "createAgent");
const mockUpdateAgent = vi.spyOn(agentRepository, "updateAgent");

const agent: AgentResponse = {
  id: "1",
  name: "테스트 에이전트",
  description: "테스트 설명",
  system_prompt: "테스트 프롬프트",
  tools: ["tool-1"],
};

beforeEach(() => {
  mockCreateAgent.mockReset();
  mockCreateAgent.mockResolvedValue(agent);
  mockUpdateAgent.mockReset();
  mockUpdateAgent.mockResolvedValue(agent);
});

describe("useAgentForm", () => {
  describe("생성 모드 (agent 없음)", () => {
    test("초기값이 빈 문자열과 빈 배열이다", () => {
      const { result } = renderHook(() => useAgentForm({ open: true }));

      expect(result.current.name).toBe("");
      expect(result.current.description).toBe("");
      expect(result.current.systemPrompt).toBe("");
      expect(result.current.selectedTools).toEqual([]);
    });

    test("submit은 입력값으로 createAgent를 한 번 호출하고 updateAgent는 호출하지 않는다", async () => {
      const { result } = renderHook(() => useAgentForm({ open: true }));

      act(() => {
        result.current.setName("새 에이전트");
        result.current.setDescription("새 설명");
        result.current.setSystemPrompt("새 프롬프트");
        result.current.setSelectedTools(["tool-1"]);
      });
      await act(async () => {
        await result.current.submit();
      });

      expect(mockCreateAgent).toHaveBeenCalledTimes(1);
      expect(mockCreateAgent).toHaveBeenCalledWith({
        name: "새 에이전트",
        description: "새 설명",
        system_prompt: "새 프롬프트",
        tools: ["tool-1"],
      });
      expect(mockUpdateAgent).not.toHaveBeenCalled();
    });
  });

  describe("수정 모드 (agent 있음)", () => {
    test("초기값이 agent 값으로 채워진다", () => {
      const { result } = renderHook(() => useAgentForm({ open: true, agent }));

      expect(result.current.name).toBe("테스트 에이전트");
      expect(result.current.description).toBe("테스트 설명");
      expect(result.current.systemPrompt).toBe("테스트 프롬프트");
      expect(result.current.selectedTools).toEqual(["tool-1"]);
    });

    test("submit은 agent id와 입력값으로 updateAgent를 호출하고 onSaved를 호출한다", async () => {
      const onSaved = vi.fn();
      const { result } = renderHook(() =>
        useAgentForm({ open: true, agent, onSaved }),
      );

      act(() => {
        result.current.setDescription("변경된 설명");
        result.current.setSystemPrompt("변경된 프롬프트");
        result.current.setSelectedTools([]);
      });
      await act(async () => {
        await result.current.submit();
      });

      expect(mockUpdateAgent).toHaveBeenCalledTimes(1);
      expect(mockUpdateAgent).toHaveBeenCalledWith("1", {
        name: "테스트 에이전트",
        description: "변경된 설명",
        system_prompt: "변경된 프롬프트",
        tools: [],
      });
      expect(onSaved).toHaveBeenCalledTimes(1);
      expect(mockCreateAgent).not.toHaveBeenCalled();
    });
  });

  describe("isComplete", () => {
    test("필수값이 모두 있으면 true다", () => {
      const { result } = renderHook(() => useAgentForm({ open: true, agent }));

      expect(result.current.isComplete).toBe(true);
    });

    test("필수값 중 하나라도 비면 false다", () => {
      const { result } = renderHook(() => useAgentForm({ open: true }));

      act(() => {
        result.current.setName("이름");
        result.current.setDescription("설명");
      });

      expect(result.current.isComplete).toBe(false);
    });
  });

  describe("열림 시 초기화", () => {
    test("생성 모드는 다시 열면 빈 값으로 초기화된다", () => {
      const { result, rerender } = renderHook(
        ({ open }) => useAgentForm({ open }),
        { initialProps: { open: true } },
      );

      act(() => {
        result.current.setName("입력 중");
        result.current.setDescription("입력 중");
      });
      rerender({ open: false });
      rerender({ open: true });

      expect(result.current.name).toBe("");
      expect(result.current.description).toBe("");
    });

    test("수정 모드는 다시 열면 agent 값으로 초기화된다", () => {
      const { result, rerender } = renderHook(
        ({ open }) => useAgentForm({ open, agent }),
        { initialProps: { open: true } },
      );

      act(() => {
        result.current.setSystemPrompt("수정 중");
      });
      rerender({ open: false });
      rerender({ open: true });

      expect(result.current.systemPrompt).toBe("테스트 프롬프트");
    });
  });
});
