import { ipcMain } from 'electron'
import serverAPI from '../../api/server'
import processAPI from '../../common/processAPI'
import { ReturnApiMapper } from '../../types'
import { Session } from '../../types/server'

// Wires the handlers to the ipcMain listeners, to respond to the client requests
export default (session: Session): ReturnApiMapper<typeof serverAPI> =>
  processAPI(serverAPI, (path, handler) => {
    const { window } = session
    const handlerWithSession = handler(session)
    ipcMain.on(path, async (_event, ...args) => {
      console.debug('Received command', path, 'with args', ...args)
      let results = await handlerWithSession(...args)
      console.debug('Replying to', path, 'with results', results)
      window.webContents.send(`${path}.complete`, results)
    })
    return handlerWithSession
  })
