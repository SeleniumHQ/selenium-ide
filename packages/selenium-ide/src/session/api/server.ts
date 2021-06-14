import { ipcMain } from 'electron'
import processAPI from '../../common/processAPI'
import { Session } from '../../types'

// Wires the handlers to the ipcMain listeners, to respond to the client requests
export default (session: Session) =>
  processAPI('server', ({ load, path }) => {
    const handler = load()(session)
    const { window } = session
    ipcMain.on(path, async (_event, ...args) => {
      console.debug('Received command', path, 'with args', ...args)
      let results = await handler(...args)
      console.debug('Replying to', path, 'with results', results)
      window.webContents.send(`${path}.complete`, results)
    })
    return handler
  })
