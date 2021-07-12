import browserEventListener from 'browser/api/classes/EventListener'
import mainEventListener from 'main/api/classes/EventListener'

export type OnNewCommandRecorder = [
  {
    suite: number
    test: string
    command: string
    target: string
    value: string
  }
]

export const browser = browserEventListener<OnNewCommandRecorder>()
export const main = mainEventListener<OnNewCommandRecorder>()
