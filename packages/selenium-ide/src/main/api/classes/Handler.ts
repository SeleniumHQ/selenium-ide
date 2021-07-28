import { ipcMain } from 'electron'
import { ApiHandler, Mutator } from 'api/types'
import { Session } from '../../types'
import getCore from '../helpers/getCore'

const defaultHandler = <HANDLER extends ApiHandler>(
  path: string,
  session: Session,
  mutator?: Mutator<any>
) => {
  const [namespace, method] = path.split('.')
  return async (...args: Parameters<HANDLER>) => {
    // @ts-ignore
    const sessionClass = session[namespace]
    const result: ReturnType<HANDLER> = await sessionClass[method](...args)
    if (mutator) {
      mutator(getCore(session), {
        params: args,
        result,
      })
    }
    return result
  }
}

const Handler =
  <HANDLER extends ApiHandler>(
    factory: <HANDLER extends ApiHandler>(
      path: string,
      session: Session,
      mutator?: Mutator<any>
    ) => (
      ...args: Parameters<HANDLER>
    ) => Promise<ReturnType<HANDLER>> = defaultHandler
  ) =>
  (path: string, session: Session, mutator?: Mutator<any>) => {
    const handler = factory<HANDLER>(path, session, mutator)
    ipcMain.on(path, async (_event, ...args) => {
      console.log('Received API Request', path, ...args)
      const result = await handler(...(args as Parameters<HANDLER>))

      console.log('Resolved API Request', path, result)
      ipcMain.emit(`${path}.complete`, { params: args, result })
    })
    return handler
  }

export default Handler
