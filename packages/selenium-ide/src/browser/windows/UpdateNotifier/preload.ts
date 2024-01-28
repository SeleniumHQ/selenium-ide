import { contextBridge, ipcRenderer } from "electron"

function doRestart() {
  ipcRenderer.send('do-restart ')
}

contextBridge.exposeInMainWorld('doRestart', doRestart);
