import polyfill from 'polyfill/index'
import {
  GenericPolyfill,
  PolyfillEntry,
  PolyfillHandler,
  PolyfillNamespace,
} from './types'

export default <FinalPolyfill extends GenericPolyfill>(
  handler: PolyfillHandler
): FinalPolyfill => {
  const api: Partial<FinalPolyfill> = {}
  for (const ns in polyfill) {
    const namespace: PolyfillNamespace = polyfill[ns]
    const entry: Partial<PolyfillNamespace> = {}
    for (const ep in namespace) {
      const endpoint = namespace[ep] as PolyfillEntry
      entry[ep] = handler(`${ns}.${ep}`, endpoint)
    }
    // @ts-ignore
    api[ns] = entry as PolyfillNamespace
  }
  return api as FinalPolyfill
}
