import browserEventListener from 'browser/api/classes/EventListener'
import mainEventListener from 'main/api/classes/EventListener'

export type OnNewCommandRecorder = [
  {
    command: string
    target: string | string[][]
    value: string | string[][]
    insertBeforeLastCommand?: boolean
    frameLocation?: string
  }
]

export const browser = browserEventListener<OnNewCommandRecorder>()
export const main = mainEventListener<OnNewCommandRecorder>()
