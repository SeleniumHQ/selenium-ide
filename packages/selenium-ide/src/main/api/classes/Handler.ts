import { ipcMain } from 'electron'
import { ApiHandler } from 'api/types'
import { Session } from '../../types'

const Handler =
  <HANDLER extends ApiHandler>(
    factory: (
      path: string,
      session: Session
    ) => (...args: Parameters<HANDLER>) => Promise<ReturnType<HANDLER>>
  ) =>
  (path: string, session: Session) => {
    const handler = factory(path, session)
    ipcMain.on(path, async (event, ...args) => {
      console.log('Received API Request', path, ...args)
      const results = await handler(...(args as Parameters<HANDLER>))
      console.log('Resolved API Request', path, results)
      event.reply(`${path}.complete`, results)
    })
    return handler
  }

export default Handler
