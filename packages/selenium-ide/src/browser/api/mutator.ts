import { process as processApi } from '@seleniumhq/side-api'
import { ApiHoist as Api } from '@seleniumhq/side-api'

/**
 * This Converts the chrome API type to something usable
 * from the front end
 */
export type BrowserApiMutatorMapper = {
  [Namespace in keyof Api]: {
    [Handler in keyof Api[Namespace]]: Api[Namespace][Handler]['mutator']
  }
}

export default processApi<BrowserApiMutatorMapper>(
  (_, handler) => handler.mutator
)
