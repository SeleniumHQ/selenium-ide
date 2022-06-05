import commands from './index'
import { GenericApi, ApiEntry, ApiHandler, ApiNamespace } from './types'

export const processApi = <FinalApi extends GenericApi>(
  handler: ApiHandler
): FinalApi => {
  const api: Partial<FinalApi> = {}
  for (const ns in commands) {
    const namespace: ApiNamespace = commands[ns]
    const entry: Partial<ApiNamespace> = {}
    for (const ep in namespace) {
      const endpoint = namespace[ep] as ApiEntry
      entry[ep] = handler(`${ns}.${ep}`, endpoint)
    }
    // @ts-expect-error
    api[ns] = entry as ApiNamespace
  }
  return api as FinalApi
}
