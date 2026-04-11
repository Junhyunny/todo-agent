import { expect, test, vi } from "vitest";

const { mockExposeInMainWorld, mockInvoke } = vi.hoisted(() => ({
  mockExposeInMainWorld: vi.fn(),
  mockInvoke: vi.fn(),
}));

vi.mock("electron", () => ({
  contextBridge: {
    exposeInMainWorld: mockExposeInMainWorld,
  },
  ipcRenderer: {
    invoke: mockInvoke,
  },
}));

test("preload는 에이전트 등록 윈도우 열기 API를 renderer에 노출한다", async () => {
  vi.resetModules();
  mockExposeInMainWorld.mockReset();
  mockInvoke.mockReset();

  await import("./preload.ts");

  expect(mockExposeInMainWorld).toHaveBeenCalledWith(
    "agentRegistration",
    expect.objectContaining({
      open: expect.any(Function),
    }),
  );

  const [, agentRegistration] = mockExposeInMainWorld.mock.calls[0];

  await agentRegistration.open();

  expect(mockInvoke).toHaveBeenCalledWith("agent-registration:open");
});
