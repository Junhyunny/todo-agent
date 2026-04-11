import { expect, test, vi } from "vitest";

const {
  mockAppOn,
  mockAppQuit,
  mockBrowserWindow,
  mockHandle,
  mockLoadFile,
  mockLoadURL,
  mockOpenDevTools,
} = vi.hoisted(() => {
  const mockAppOn = vi.fn();
  const mockAppQuit = vi.fn();
  const mockHandle = vi.fn();
  const mockLoadURL = vi.fn();
  const mockLoadFile = vi.fn();
  const mockOpenDevTools = vi.fn();
  const mockBrowserWindow = vi.fn(
    class {
      loadURL = mockLoadURL;
      loadFile = mockLoadFile;
      webContents = {
        openDevTools: mockOpenDevTools,
      };
    },
  );

  return {
    mockAppOn,
    mockAppQuit,
    mockBrowserWindow,
    mockHandle,
    mockLoadFile,
    mockLoadURL,
    mockOpenDevTools,
  };
});

vi.mock("electron", () => ({
  app: {
    on: mockAppOn,
    quit: mockAppQuit,
  },
  BrowserWindow: mockBrowserWindow,
  ipcMain: {
    handle: mockHandle,
  },
}));

vi.mock("electron-squirrel-startup", () => ({
  default: false,
}));

test("에이전트 등록 윈도우 열기 요청을 처리하면 새 창을 만들고 화면을 로드한다", async () => {
  vi.resetModules();
  mockAppOn.mockReset();
  mockHandle.mockReset();
  mockBrowserWindow.mockClear();
  mockLoadURL.mockClear();
  mockLoadFile.mockClear();
  mockOpenDevTools.mockClear();

  const globals = globalThis as typeof globalThis & {
    MAIN_WINDOW_VITE_DEV_SERVER_URL?: string;
    MAIN_WINDOW_VITE_NAME?: string;
  };

  globals.MAIN_WINDOW_VITE_DEV_SERVER_URL = "http://localhost:5173";
  globals.MAIN_WINDOW_VITE_NAME = "main_window";

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
