import { contextBridge, ipcRenderer } from "electron"

function acceptConfirmation() {
  ipcRenderer.send('accept-confirmation', true)
}

function confirmationError(error: Error | string) {
  if (error instanceof Error) {
    error = error.message
  }

  ipcRenderer.send('confirmation-error', error)
}

function dismissConfirmation() {
  ipcRenderer.send('dismiss-confirmation', false)
}

contextBridge.exposeInMainWorld('dismissConfirmation', dismissConfirmation);
contextBridge.exposeInMainWorld('confirmError', confirmationError);
contextBridge.exposeInMainWorld('acceptConfirmation', acceptConfirmation);
