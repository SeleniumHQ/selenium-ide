import { ipcMain } from 'electron'
import { ApiHandler } from 'polyfill/types'
import { Session } from '../../types'

const HandlerWithEvent =
  <HANDLER extends ApiHandler>(
    factory: (
      path: string,
      session: Session
    ) => (...args: Parameters<HANDLER>) => Promise<ReturnType<HANDLER>>
  ) =>
  (path: string, session: Session) => {
    const handler = factory(path, session)
    ipcMain.on(path, async (event, ...args) => {
      const argsWithEvent = [event, ...args] as Parameters<HANDLER>
      const results = await handler(...argsWithEvent)
      event.reply(`${path}.complete`, results)
    })
    return handler
  }

export default HandlerWithEvent
