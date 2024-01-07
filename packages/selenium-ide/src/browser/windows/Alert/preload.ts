import { contextBridge, ipcRenderer } from "electron"

function alertError(error: Error | string) {
  if (error instanceof Error) {
    error = error.message
  }

  ipcRenderer.send('alert-error', error)
}

function acceptAlert() {
  ipcRenderer.send('accept-alert')
}

contextBridge.exposeInMainWorld('acceptAlert', acceptAlert);
contextBridge.exposeInMainWorld('alertError', alertError);
