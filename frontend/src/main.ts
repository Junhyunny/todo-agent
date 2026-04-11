import path from "node:path";
import { app, BrowserWindow, ipcMain } from "electron";
import started from "electron-squirrel-startup";

if (started) {
  app.quit();
}

type HashRoute = {
  hash: string;
};

const loadRendererWindow = (
  targetWindow: BrowserWindow,
  url: string,
  hashRoute: HashRoute,
) => {
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    targetWindow.loadURL(url);
  } else {
    targetWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
      hashRoute,
    );
  }
};

const createWindow = () => {
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  loadRendererWindow(window, MAIN_WINDOW_VITE_DEV_SERVER_URL, {
    hash: "",
  });
  window.webContents.openDevTools();
};

const createAgentRegistrationWindow = () => {
  const window = new BrowserWindow({
    width: 500,
    height: 600,
    title: "에이전트 등록",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  loadRendererWindow(
    window,
    `${MAIN_WINDOW_VITE_DEV_SERVER_URL}#/agent-registration`,
    {
      hash: "agent-registration",
    },
  );
};

ipcMain.handle("agent-registration:open", async () => {
  createAgentRegistrationWindow();
});

ipcMain.handle("agent-registration:close", async ({ sender }) => {
  BrowserWindow.fromWebContents(sender)?.close();
});

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
