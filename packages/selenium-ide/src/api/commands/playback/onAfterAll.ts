import browserEventListener from 'browser/api/classes/EventListener'
import mainEventListener from 'main/api/classes/EventListener'

export type OnAfterAllPlayback = [
  {
    suite: string
  }
]

export const browser = browserEventListener<OnAfterAllPlayback>()
export const main = mainEventListener<OnAfterAllPlayback>()
