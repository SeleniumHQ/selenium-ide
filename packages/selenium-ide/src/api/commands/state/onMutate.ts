import { ApiHandler, AsyncReturnType } from 'api/types'
import browserEventListener from 'browser/api/classes/EventListener'
import mainEventListener from 'main/api/classes/EventListener'

export type OnMutate<HANDLER extends ApiHandler> = [
  path: string,
  request: {
    params: Parameters<HANDLER>
    result: AsyncReturnType<HANDLER> | null
  }
]

export const browser = browserEventListener<OnMutate<ApiHandler>>()
export const main = mainEventListener<OnMutate<ApiHandler>>()
