import { ipcRenderer } from 'electron'
import identity from 'lodash/fp/identity'
import { ApiHandler, ApiPromiseHandler, ThenArg } from 'api/types'
import { LoadedWindow } from '../../types'

const doAPI = <HANDLER extends ApiPromiseHandler>(
  path: string,
  ...args: Parameters<HANDLER>
): Promise<ThenArg<ReturnType<HANDLER>>> =>
  new Promise<ThenArg<ReturnType<HANDLER>>>((resolve) => {
    ipcRenderer.once(`${path}.complete`, (_event, result) => {
      console.debug('Reply from server', path, 'with results', result)
      resolve(result as ThenArg<ReturnType<HANDLER>>)
    })
    ipcRenderer.send(path, ...args)
  })

interface HandlerConfig {
  transform: (path: string, context: LoadedWindow) => ApiHandler
}

const defaultHandlerConfig: HandlerConfig = {
  transform: () => identity,
}

const Handler =
  <HANDLER extends ApiPromiseHandler>(config = defaultHandlerConfig) =>
  (path: string, window: LoadedWindow) => {
    const transform = config.transform(path, window) || identity
    return async (
      ...args: Parameters<HANDLER>
    ): Promise<ThenArg<ReturnType<HANDLER>>> => {
      console.debug(path, 'api called', ...(args as any))
      const maybeCallback = args[args.length - 1]
      const isCallback = typeof maybeCallback === 'function'
      const argsWithoutCallback = isCallback
        ? (args.slice(0, -1) as Parameters<HANDLER>)
        : args
      /**
       * Running the function
       */
      const serverResult = await doAPI<HANDLER>(path, ...argsWithoutCallback)
      const result = transform(serverResult)
      console.debug(path, 'api complete', result)
      /**
       * Processing the result
       */
      if (isCallback) {
        return maybeCallback(...result)
      }
      return result
    }
  }

export default Handler
