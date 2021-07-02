import { ipcRenderer } from 'electron'
import identity from 'lodash/fp/identity'
import { VariadicArgs } from 'polyfill/types'
import { LoadedWindow } from '../types'

const doAPI = <ARGS extends VariadicArgs, RETURN extends VariadicArgs>(
  path: string,
  ...args: ARGS
): Promise<RETURN> =>
  new Promise((resolve) => {
    ipcRenderer.once(`${path}.complete`, (_event, ...args2) => {
      console.debug('Reply from server', path, 'with results', args2)
      resolve(args2 as RETURN)
    })
    ipcRenderer.send(path, ...args)
  })

const Handler =
  <ARGS extends VariadicArgs, RETURN extends VariadicArgs>(
    transform = identity
  ) =>
  (path: string, _window: LoadedWindow) =>
  async (...args: ARGS): Promise<RETURN> => {
    console.debug(path, 'api called', ...args)
    const maybeCallback = args[args.length - 1]
    const isCallback = typeof maybeCallback === 'function'
    const argsWithoutCallback = isCallback ? (args.slice(0, -1) as ARGS) : args
    const serverResult = await doAPI<ARGS, RETURN>(path, ...argsWithoutCallback)
    const result = transform(serverResult)
    console.debug(path, 'api complete', result)
    if (isCallback) {
      return maybeCallback(...result)
    }
    if (result.length === 1) {
      return result[0]
    }
    return result
  }

export default Handler
