import processPolyfill from 'polyfill/process'
import { Polyfill } from 'polyfill/index'
import { LoadedWindow } from 'browser/types'

/**
 * This Converts the chrome API type to something usable
 * from the front end
 */
export type BrowserPolyfillMapper = {
  [Namespace in keyof Polyfill]: {
    [Handler in keyof Polyfill[Namespace]]: ReturnType<
      Polyfill[Namespace][Handler]['browser']
    >
  }
}

export default processPolyfill<BrowserPolyfillMapper>((path, handler) =>
  handler.browser(path, window as LoadedWindow)
)
