import { ipcMain } from 'electron'
import { ApiHandler, Mutator } from 'api/types'
import { Session } from '../../types'
import getCore from '../helpers/getCore'

const Handler =
  <HANDLER extends ApiHandler>() =>
  (path: string, session: Session, mutator: Mutator<HANDLER>) => {
    interface HandlerParams {
      params: Parameters<HANDLER>
      result: null
    }
    const handler = ({ params, result }: HandlerParams) => {
      mutator(getCore(session), { params, result })
      session.api.state.onMutate.dispatchEvent(path, { params, result })
    }
    ipcMain.on(path, async (_event, ...args) => {
      const params = args as Parameters<HANDLER>
      console.log('Received Mutator Request', path, ...params)
      handler({ params, result: null })

      console.log('Resolved Mutator Request', path)
      ipcMain.emit(`${path}.complete`, { params, result: null })
    })
    return handler
  }

export default Handler
