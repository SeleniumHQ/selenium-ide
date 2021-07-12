import browserEventListener from 'browser/api/classes/EventListener'
import mainEventListener from 'main/api/classes/EventListener'

export type OnBeforePlayback = [
  {
    suite: string
    test: string
    startIndex: number
    endIndex: number
  }
]

export const browser = browserEventListener<OnBeforePlayback>()
export const main = mainEventListener<OnBeforePlayback>()
