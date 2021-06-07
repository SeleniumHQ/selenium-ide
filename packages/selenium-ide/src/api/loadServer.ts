import { ipcMain } from 'electron'
import loadClientAPI from '@seleniumhq/selenium-ide-renderer/dist/api/loadServer'
import api from '.'
import { Config } from '../types'

export default async (config: Config) => {
  // Wires the handlers to the ipcMain listeners, to respond to the client requests
  const serverAPI = api(config)
  const { window } = config
  Object.entries(serverAPI).forEach(([namespace, mapping]) =>
    Object.entries(mapping).forEach(([command, handler]) => {
      const fullCommand = `${namespace}.${command}`
      ipcMain.on(fullCommand, async (_event, ...args) => {
        console.debug(`Received command ${fullCommand} with args`, ...args)
        let results = await handler(...args)
        console.debug(`Replying to ${fullCommand} with results ${results}`)
        window.webContents.send(`${fullCommand}.complete`, results)
      })
    })
  )
  const clientAPI = await loadClientAPI(config)
  return {
    client: clientAPI,
    server: serverAPI,
  }
}
