import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  mockAppOn,
  mockBrowserWindow,
  mockClose,
  mockFromWebContents,
  mockHandle,
  mockLoadFile,
  mockLoadURL,
  mockOpenDevTools,
} = vi.hoisted(() => {
  const mockAppOn = vi.fn();
  const mockHandle = vi.fn();
  const mockLoadURL = vi.fn();
  const mockLoadFile = vi.fn();
  const mockOpenDevTools = vi.fn();
  const mockClose = vi.fn();
  const mockFromWebContents = vi.fn(() => ({ close: mockClose }));
  const mockBrowserWindow = Object.assign(
    vi.fn(
      class {
        loadURL = mockLoadURL;
        loadFile = mockLoadFile;
        webContents = {
          openDevTools: mockOpenDevTools,
        };
      },
    ),
    { fromWebContents: mockFromWebContents },
  );

  return {
    mockAppOn,
    mockBrowserWindow,
    mockClose,
    mockFromWebContents,
    mockHandle,
    mockLoadFile,
    mockLoadURL,
    mockOpenDevTools,
  };
});

vi.mock("electron", () => ({
  app: {
    on: mockAppOn,
  },
  BrowserWindow: mockBrowserWindow,
  ipcMain: {
    handle: mockHandle,
  },
}));

vi.mock("electron-squirrel-startup", () => ({
  default: false,
}));

describe("main process", () => {
  beforeEach(() => {
    vi.resetModules();
    mockHandle.mockReset();
    mockBrowserWindow.mockClear();
    mockLoadURL.mockClear();
    mockLoadFile.mockClear();
    mockOpenDevTools.mockClear();
  });

  test("에이전트 등록 윈도우 열기 요청을 처리하면 새 창을 만들고 화면을 로드한다", async () => {
    const globals = globalThis as typeof globalThis & {
      MAIN_WINDOW_VITE_DEV_SERVER_URL?: string;
    };

    globals.MAIN_WINDOW_VITE_DEV_SERVER_URL = "http://localhost:5173";

    await import("./main.ts");

    expect(mockHandle).toHaveBeenCalledWith(
      "agent-registration:open",
      expect.any(Function),
    );

    const [, openAgentRegistration] = mockHandle.mock.calls[0];

    await openAgentRegistration();

    expect(mockBrowserWindow).toHaveBeenCalledWith(
      expect.objectContaining({
        width: 500,
        height: 600,
        title: "에이전트 등록",
        webPreferences: expect.objectContaining({
          preload: expect.stringContaining("preload.js"),
        }),
      }),
    );
    expect(mockLoadURL).toHaveBeenCalledWith(
      "http://localhost:5173#/agent-registration",
    );
  });

  test("에이전트 등록 윈도우 닫기 요청을 처리하면 요청을 보낸 창을 닫는다", async () => {
    await import("./main.ts");

    expect(mockHandle).toHaveBeenCalledWith(
      "agent-registration:close",
      expect.any(Function),
    );

    const closeCall = mockHandle.mock.calls.find(
      ([channel]) => channel === "agent-registration:close",
    );
    const [, closeAgentRegistration] = closeCall!;

    const mockSender = {};
    await closeAgentRegistration({ sender: mockSender });

    expect(mockFromWebContents).toHaveBeenCalledWith(mockSender);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});
