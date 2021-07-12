import { ipcMain } from 'electron'
import { ApiHandler } from 'api/types'
import { Session } from '../../types'

const defaultHandler = <HANDLER extends ApiHandler>(
  path: string,
  session: Session
) => {
  const [namespace, method] = path.split('.')
  return async (...args: Parameters<HANDLER>) => {
    // @ts-ignore
    const sessionClass = session[namespace]
    const result: ReturnType<HANDLER> = await sessionClass[method](...args)
    return result
  }
}

const Handler =
  <HANDLER extends ApiHandler>(
    factory: <HANDLER extends ApiHandler>(
      path: string,
      session: Session
    ) => (
      ...args: Parameters<HANDLER>
    ) => Promise<ReturnType<HANDLER>> = defaultHandler
  ) =>
  (path: string, session: Session) => {
    const handler = factory<HANDLER>(path, session)
    ipcMain.on(path, async (event, ...args) => {
      console.log('Received API Request', path, ...args)
      const results = await handler(...(args as Parameters<HANDLER>))
      console.log('Resolved API Request', path, results)
      event.reply(`${path}.complete`, results)
    })
    return handler
  }

export default Handler
