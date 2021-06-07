import { contextBridge, ipcRenderer } from 'electron'
import loadClient from '@seleniumhq/selenium-ide-renderer/dist/api/loadClient'
import { LoadedWindow } from '@seleniumhq/selenium-ide-renderer/dist/types'
import api from '.'
import { Api, Config } from '../types'

/**
 * This module uses the preload step to establish secured IPC channels
 * for the client to request elevated privelege stuff
 * ie Write file batches, install extensions from file URLs, etc
 */
process.once('loaded', async () => {
  /**
   * We don't actually have access to the app or window here,
   * so we can just fake it to hydrate our API shapes
   */
  const pseudoAPI = await api((null as unknown) as Config)
  const exposedAPI = {
    client: loadClient(ipcRenderer),
    // Define the server API via ipcRenderer send channels
    server: Object.entries(pseudoAPI).reduce(
      (acc, [namespace, mapping]) => ({
        ...acc,
        [namespace]: Object.entries(mapping).reduce(
          (acc2, [command]) => ({
            ...acc2,
            [command]: (...args: any[]) => {
              const fullCommand = `${namespace}.${command}`
              console.debug(
                `Received command ${fullCommand} with args`,
                ...args
              )
              new Promise(resolve => {
                ipcRenderer.once(
                  `${fullCommand}.complete`,
                  (_event, ...args2) => {
                    console.debug(
                      `Replying to ${fullCommand} with results ${args2}`
                    )
                    resolve(args2)
                  }
                )
                ipcRenderer.send(`${namespace}.${command}`, ...args)
              })
            },
          }),
          {}
        ),
      }),
      {}
    ),
  } as Api
  window.seleniumIDE = exposedAPI // Keep it in the preload thread where the api is set up
  contextBridge.exposeInMainWorld('seleniumIDE', exposedAPI)
})
