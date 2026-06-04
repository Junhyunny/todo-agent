import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import * as agentRepository from "@/repository/agent-repository.ts";
import { useDuplicateAgentName } from "./useDuplicateAgentName.ts";

const mockExistsAgentByName = vi.spyOn(agentRepository, "existsAgentByName");

describe("useDuplicateAgentName", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockExistsAgentByName.mockReset();
    mockExistsAgentByName.mockResolvedValue(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("디바운스 시간 내 연속 입력은 마지막 값으로 한 번만 검사한다", async () => {
    const { rerender } = renderHook(({ name }) => useDuplicateAgentName(name), {
      initialProps: { name: "" },
    });

    rerender({ name: "기" });
    rerender({ name: "기존" });
    rerender({ name: "기존 에이전트" });

    expect(mockExistsAgentByName).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(mockExistsAgentByName).toHaveBeenCalledTimes(1);
    expect(mockExistsAgentByName).toHaveBeenCalledWith("기존 에이전트");
  });

  test("디바운스 시간이 지나기 전에는 검사하지 않는다", async () => {
    const { rerender } = renderHook(({ name }) => useDuplicateAgentName(name), {
      initialProps: { name: "" },
    });

    rerender({ name: "에이전트" });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(299);
    });

    expect(mockExistsAgentByName).not.toHaveBeenCalled();
  });

  test("중복이면 true, 아니면 false를 반환한다", async () => {
    mockExistsAgentByName.mockResolvedValue(true);
    const { result, rerender } = renderHook(
      ({ name }) => useDuplicateAgentName(name),
      { initialProps: { name: "" } },
    );

    rerender({ name: "중복 이름" });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(result.current).toBe(true);
  });

  test("이름이 비어 있으면 검사하지 않고 false를 반환한다", async () => {
    const { result } = renderHook(() => useDuplicateAgentName(""));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(mockExistsAgentByName).not.toHaveBeenCalled();
    expect(result.current).toBe(false);
  });

  test("이름을 지우면 대기 중인 검사를 취소하고 false로 초기화한다", async () => {
    mockExistsAgentByName.mockResolvedValue(true);
    const { result, rerender } = renderHook(
      ({ name }) => useDuplicateAgentName(name),
      { initialProps: { name: "중복 이름" } },
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(result.current).toBe(true);

    rerender({ name: "" });

    expect(result.current).toBe(false);
  });
});
