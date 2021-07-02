import processPolyfill from 'polyfill/process'
import { Polyfill } from 'polyfill/index'
import { LoadedWindow } from './types'

export type BrowserPolyfillMapper = {
  [NS in keyof Polyfill]: {
    [P in keyof Polyfill[NS]]: ReturnType<Polyfill[NS][P]['browser']>
  }
}

export default processPolyfill<BrowserPolyfillMapper>((path, handler) =>
  handler.browser(path, window as LoadedWindow)
)
