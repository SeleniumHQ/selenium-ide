import {
  ApiPromiseHandler,
  DefaultRouteShape,
  ThenArg,
} from '@seleniumhq/side-api'
import { sendMessage } from './DriverUtils'

export const resolversByID: Record<string, (...args: any[]) => void> = {}

const doAPI = async <HANDLER extends ApiPromiseHandler>(
  path: string,
  ...args: Parameters<HANDLER>
): Promise<ThenArg<ReturnType<HANDLER>>> =>
  new Promise((resolve) => {
    const handler = (event: MessageEvent<Awaited<ReturnType<HANDLER>>>) => {
      console.log('event', event)
      if (event.data.path === `${path}.complete`) {
        window.removeEventListener('message', handler)
        resolve(event.data)
      }
    }
    console.debug('Emitting to server', path, 'with args', args)
    const id = sendMessage({ path, args })
    resolversByID[id] = resolve
  })

const Handler =
  <HANDLER extends ApiPromiseHandler = DefaultRouteShape>() =>
  (path: string) => {
    return async (
      ...args: Parameters<HANDLER>
    ): Promise<ThenArg<ReturnType<HANDLER>>> => {
      console.debug(path, 'api called', ...(args as any))
      console.info('SELENIUM_IDE_COMMAND:', path, ...(args as any))
      const result = await doAPI<HANDLER>(path, ...args)
      console.debug(path, 'api complete', result)
      return result
    }
  }

export default Handler
