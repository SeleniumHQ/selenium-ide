import { contextBridge, ipcRenderer } from "electron"

function completeUpdateNotifier() {
  ipcRenderer.send('do-restart')
}

contextBridge.exposeInMainWorld('completeUpdateNotifier', completeUpdateNotifier);
