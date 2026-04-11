import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("agentRegistration", {
  open: () => ipcRenderer.invoke("agent-registration:open"),
});
