import browserEventListener from 'browser/api/classes/EventListener'
import mainEventListener from 'main/api/classes/EventListener'

export type OnBeforeAllPlayback = [
  {
    suite: number
  }
]

export const browser = browserEventListener<OnBeforeAllPlayback>()
export const main = mainEventListener<OnBeforeAllPlayback>()
