import { ipcMain } from 'electron'
import { ApiHandler, DefaultRouteShape, EmptyApiHandler, Mutator } from 'api/types'
import { Session, SessionControllerKeys } from '../../types'
import getCore from '../helpers/getCore'
import { COLOR_CYAN, vdebuglog } from 'main/util'

const apiDebugLog = vdebuglog('api', COLOR_CYAN)

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
  _session: Session
): AsyncHandler<HANDLER> => {
  const handler = async (..._args: Parameters<HANDLER>) => {}
  return handler as unknown as AsyncHandler<HANDLER>
}
export const passthrough = passThroughHandler

const Handler =
  <HANDLER extends ApiHandler = DefaultRouteShape>(
    factory: HandlerFactory<HANDLER> = defaultHandler
  ) =>
  (path: string, session: Session, mutator?: Mutator<HANDLER>) => {
    const handler = factory(path, session)
    const doAPI = async (...params: Parameters<HANDLER>) => {
      const result = await handler(...params)
      if (mutator) {
        const { project, state } = mutator(getCore(session), { params, result })
        session.projects.project = project
        session.state.state = state
        session.api.state.onMutate.dispatchEvent(path, { params, result })
      }
      return result
    }
    ipcMain.on(path, async (event, ...args) => {
      apiDebugLog('Received API Request', path, args)
      const result = await doAPI(...(args as Parameters<HANDLER>))
      apiDebugLog('Resolved API Request', path, result)
      event.senderFrame.send(`${path}.complete`, result)
    })
    return doAPI
  }

export default Handler
