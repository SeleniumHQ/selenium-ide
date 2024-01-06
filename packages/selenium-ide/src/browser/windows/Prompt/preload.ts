import { contextBridge, ipcRenderer } from "electron"

function promptCancel() {
  ipcRenderer.send('prompt-cancel')
}

function promptError(error: Error | string) {
  if (error instanceof Error) {
    error = error.message
  }

  ipcRenderer.send('prompt-error', error)
}

function promptSubmit(answer: string) {
  ipcRenderer.send('prompt-submit', answer)
}

contextBridge.exposeInMainWorld('promptCancel', promptCancel);
contextBridge.exposeInMainWorld('promptError', promptError);
contextBridge.exposeInMainWorld('promptSubmit', promptSubmit);
