import { ipcRenderer } from 'electron'
import clientAPI from '../../api/client'
import processAPI from '../../common/processAPI'
import { DirectApiMapper } from '../../types'

export default processAPI<typeof clientAPI, DirectApiMapper<typeof clientAPI>>(
  clientAPI,
  (path, handler) => {
    ipcRenderer.on(path, async (_event, ...args) => {
      console.debug(`Received command ${path} with args`, ...args)
      const results = await handler(...args)
      console.debug(`Replying to ${path} with results`, results)
      ipcRenderer.send(`${path}.complete`, results)
    })
    return handler
  }
)
