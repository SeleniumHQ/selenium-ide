import polyfill from 'polyfill/index'
import {
  PolyfillEntry,
  PolyfillHandler,
  PolyfillResult,
  PolyfillNamespace,
} from './types'

export default <Return extends PolyfillResult>(
  handler: PolyfillHandler
): Return => {
  const api: Partial<Return> = {}
  for (const ns in polyfill) {
    const namespace: PolyfillNamespace = polyfill[ns]
    const entry: any = (api[ns] = {})
    for (const ep in namespace) {
      const endpoint = namespace[ep] as PolyfillEntry
      entry[ep] = handler(`${ns}.${ep}`, endpoint)
    }
  }
  return api as Return
}
