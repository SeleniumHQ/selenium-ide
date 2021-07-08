import browserEventListener from 'browser/api/classes/EventListener'
import mainEventListener from 'main/api/classes/EventListener'

export type OnBeforePlayback = [
  {
    suite: number
    test: number
    startStep: number
    endStep: number
  }
]

export const browser = browserEventListener<OnBeforePlayback>()
export const main = mainEventListener<OnBeforePlayback>()
