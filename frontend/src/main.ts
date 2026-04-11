import path from "node:path";
import { app, BrowserWindow, ipcMain } from "electron";
import started from "electron-squirrel-startup";

if (started) {
  app.quit();
}

const loadRendererWindow = (targetWindow: BrowserWindow) => {
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    targetWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    targetWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }
};

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  loadRendererWindow(mainWindow);
  mainWindow.webContents.openDevTools();
};

const createAgentRegistrationWindow = () => {
  const agentRegistrationWindow = new BrowserWindow({
    width: 500,
    height: 600,
    title: "에이전트 등록",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  loadRendererWindow(agentRegistrationWindow);
};

ipcMain.handle("agent-registration:open", async () => {
  createAgentRegistrationWindow();
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
