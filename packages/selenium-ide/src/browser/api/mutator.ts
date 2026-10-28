import { processApi } from '@seleniumhq/side-api'
import { ApiHoist as Api } from '@seleniumhq/side-api'

type FunctionKeys<T extends Record<string, {mutator?: (...args: any[]) => any}>> = {
  [K in keyof T as T[K]['mutator'] extends (...args: any[]) => any ? K : never]: T[K]['mutator'];
};

/**
 * This Converts the chrome API type to something usable
 * from the front end
 */
export type BrowserApiMutators = {
  [Namespace in keyof Api]: FunctionKeys<Api[Namespace]>
}

export default processApi<BrowserApiMutators>(
  (_, handler) => handler.mutator
)
