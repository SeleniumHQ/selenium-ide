import api from '.'
import { ApiHandler, ApiNamespaceShape, ApiShape } from '../types'

export default (ipcRenderer: Electron.IpcRenderer): ApiShape => {
  Object.entries(api).forEach(
    ([namespace, mapping]: [string, ApiNamespaceShape]) => {
      Object.entries(mapping).forEach(
        ([command, handler]: [string, ApiHandler]) => {
          const fullCommand = `${namespace}.${command}`
          ipcRenderer.on(fullCommand, async (_event, ...args) => {
            console.debug(`Received command ${fullCommand} with args`, ...args)
            const results = await handler(...args)
            console.debug(`Replying to ${fullCommand} with results`, results)
            ipcRenderer.send(`${fullCommand}.complete`, results)
          })
        }
      )
    }
  )
  return api
}
