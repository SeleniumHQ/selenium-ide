import { ipcMain } from 'electron'
import { ApiHandler, EmptyApiHandler, Mutator } from 'api/types'
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

const passThroughHandler = <HANDLER extends EmptyApiHandler>(
  _path: string,
  _session: Session,
): AsyncHandler<HANDLER> => {
  const handler = async (..._args: Parameters<HANDLER>) => {}
  return handler as unknown as AsyncHandler<HANDLER>
}
export const passthrough = passThroughHandler

const Handler =
  <HANDLER extends ApiHandler>(
    factory: HandlerFactory<HANDLER> = defaultHandler
  ) =>
  (path: string, session: Session, mutator?: Mutator<HANDLER>) => {
    const handler = factory(path, session)
    const fullHandler = async (...params: Parameters<HANDLER>) => {
      const result = await handler(...params)
      if (mutator) {
        const newState = mutator(getCore(session), { params, result })
        session.projects.project = newState.project
        session.state.state = newState.state
        session.api.state.onMutate.dispatchEvent(path, { params, result })
      }
      return result
    };
    ipcMain.on(path, async (_event, ...args) => {
      // console.debug('Received API Request', path, ...args)
      const params = args as Parameters<HANDLER>
      const result = await fullHandler(...params)
      // console.debug('Resolved API Request', path, result)
      _event.sender.send(`${path}.complete`, result)
    })
    return fullHandler
  }

export default Handler
