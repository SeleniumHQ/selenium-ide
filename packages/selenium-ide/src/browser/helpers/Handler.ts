import { ipcRenderer } from 'electron'
import identity from 'lodash/fp/identity'
import { ApiHandler } from 'polyfill/types'
import { LoadedWindow } from '../types'

const doAPI = <HANDLER extends ApiHandler>(
  path: string,
  ...args: Parameters<HANDLER>
): Promise<ReturnType<HANDLER>> =>
  new Promise((resolve) => {
    ipcRenderer.once(`${path}.complete`, (_event, ...args2) => {
      console.debug('Reply from server', path, 'with results', args2)
      resolve(args2 as ReturnType<HANDLER>)
    })
    // @ts-ignore
    ipcRenderer.send(path, ...args)
  })

interface HandlerConfig {
  transform: (path: string, context: LoadedWindow) => ApiHandler
}

const defaultHandlerConfig: HandlerConfig = {
  transform: () => identity,
}

const Handler =
  <HANDLER extends ApiHandler>(config = defaultHandlerConfig) =>
  (path: string, window: LoadedWindow) =>
  async (...args: Parameters<HANDLER>): Promise<ReturnType<HANDLER>> => {
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
    const transform = config.transform || identity
    const result = transform(serverResult, window)
    console.debug(path, 'api complete', result)
    /**
     * Processing the result
     */
    if (isCallback) {
      return maybeCallback(result)
    }
    if (result.length === 1) {
      return result[0]
    }
    return result
  }

export default Handler
