import { contextBridge, ipcRenderer } from "electron"

function dismissPrompt() {
  ipcRenderer.send('dismiss-prompt')
}

function promptError(error: Error | string) {
  if (error instanceof Error) {
    error = error.message
  }

  ipcRenderer.send('prompt-error', error)
}

function answerPrompt(answer: string) {
  ipcRenderer.send('answer-prompt', answer)
}

contextBridge.exposeInMainWorld('answerPrompt', answerPrompt);
contextBridge.exposeInMainWorld('dismissPrompt', dismissPrompt);
contextBridge.exposeInMainWorld('promptError', promptError);
