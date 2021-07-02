import polyfill from 'polyfill/index'
import { PolyfillEntry, PolyfillHandler, PolyfillResult } from './types'

export default <Return extends PolyfillResult>(
  handler: PolyfillHandler
): Return => {
  const api: PolyfillResult = {}
  for (const ns in polyfill) {
    const namespace: any = polyfill[ns]
    const entry: any = (api[ns] = {})
    for (const ep in namespace) {
      const endpoint = namespace[ep] as PolyfillEntry
      entry[ep] = handler(`${ns}.${ep}`, endpoint)
    }
  }
  return api as Return
}
