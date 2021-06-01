const commands = require('./commands')
const { contextBridge, ipcRenderer } = require('electron')

/**
 * This function uses the preload step to establish secured IPC channels
 * for the client to request elevated privelege stuff
 * ie Write file batches, install extensions from file URLs, etc
 */

process.once('loaded', () => {
  contextBridge.exposeInMainWorld(
    'seleniumIDE',
    Object.keys(commands).reduce(
      (acc, commandName) => ({
        ...acc,
        [commandName]: (...args) => ipcRenderer.send(commandName, ...args),
      }),
      {}
    )
  )
})
