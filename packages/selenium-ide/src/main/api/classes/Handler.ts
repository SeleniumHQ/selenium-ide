import { ipcMain } from 'electron'
import { ApiHandler, Mutator } from 'api/types'
import { Session, SessionControllerKeys } from '../../types'
import getCore from '../helpers/getCore'

export type AsyncHandler<HANDLER extends ApiHandler> = (
  ...args: Parameters<HANDLER>
) => Promise<ReturnType<HANDLER>>

export type HandlerFactory<HANDLER extends ApiHandler> = (
  path: string,
  session: Session
) => AsyncHandler<HANDLER>

const defaultHandler = <HANDLER extends ApiHandler>(
  path: string,
  session: Session
): AsyncHandler<HANDLER> => {
  const [namespace, method] = path.split('.')
  const controller = session[namespace as SessionControllerKeys]
  if (controller && method in controller) {
    // @ts-expect-error
    return controller[method].bind(controller) as AsyncHandler<HANDLER>
  }
  throw new Error(`Missing method for path ${path}`)
}

const Handler =
  <HANDLER extends ApiHandler>(
    factory: HandlerFactory<HANDLER> = defaultHandler
  ) =>
  (path: string, session: Session, mutator?: Mutator<HANDLER>) => {
    const handler = factory(path, session)
    ipcMain.on(path, async (_event, ...args) => {
      console.debug('Received API Request', path, ...args)
      const params = args as Parameters<HANDLER>
      const result = await handler(...params)
      console.debug('Resolved API Request', path, result)
      if (mutator) {
        const newState = mutator(getCore(session), { params, result })
        session.projects.project = newState.project
        session.state.state = newState.state
        session.api.state.onMutate.dispatchEvent(path, { params, result })
      }
      _event.sender.send(`${path}.complete`, result)
    })
    return handler
  }

export default Handler
