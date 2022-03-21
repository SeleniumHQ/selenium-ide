import browserEventListener from 'browser/api/classes/EventListener'
import mainEventListener from 'main/api/classes/EventListener'

export type OnMutate = [
  path: string,
  data: any
]

export const browser = browserEventListener<OnMutate>()
export const main = mainEventListener<OnMutate>()
