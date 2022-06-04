import { CoreSessionData, process as processApi } from '@seleniumhq/side-api'
import { ApiHoist as Api } from '@seleniumhq/side-api'

/**
 * This Converts the chrome API type to something usable
 * from the front end
 */
export type BrowserMutatorApi = {
  [Namespace in keyof Api]: {
    [Handler in keyof Api[Namespace]]: Api[Namespace][Handler]['mutator']
  }
}

export type MutatorShape =
  | undefined
  | ((session: CoreSessionData, arg: any  ) => CoreSessionData)

export default processApi<BrowserMutatorApi, MutatorShape>(
  (_, entry) => entry.mutator
) as BrowserMutatorApi
