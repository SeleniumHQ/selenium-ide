import { ipcMain } from 'electron'
import { ApiHandler } from 'polyfill/types'
import { Session } from '../types'

const Handler =
  <HANDLER extends ApiHandler>(
    factory: (path: string, session: Session) => HANDLER
  ) =>
  (path: string, session: Session) => {
    const handler: HANDLER = factory(path, session)
    ipcMain.on(path, async (event, ...args) => {
      const results = await handler(...args)
      event.reply(`${path}.complete`, ...results)
    })
    return handler
  }

export default Handler
