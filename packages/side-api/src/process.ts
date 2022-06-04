import commands, { Api } from './index'
import { ApiEntry, ApiEventListener, ApiHandler, ApiNamespace } from './types'

export type ApiProcessor<ENTRY_SHAPE = ApiHandler | ApiEventListener> = (
  path: string,
  entry: ApiEntry
) => ENTRY_SHAPE

export default <SHAPE = Api, ENTRY_SHAPE = ApiHandler | ApiEventListener>(
  handler: ApiProcessor<ENTRY_SHAPE>
): SHAPE => {
  const api: Partial<SHAPE> = {}
  for (const ns in commands) {
    const apiNamespace: ApiNamespace = commands[ns]
    const namespace: Partial<ApiNamespace> = {}
    for (const command in apiNamespace) {
      const entry = apiNamespace[command] as ApiEntry
      namespace[command] = handler(`${ns}.${command}`, entry)
    }
    // @ts-expect-error
    api[ns] = namespace as ApiNamespace
  }
  return api as SHAPE
}
