import browserEventListener from 'browser/api/classes/EventListener'
import mainEventListener from 'main/api/classes/EventListener'

export type OnAfterPlayback = [
  {
    suite: string
    test: string
    endIndex: number
    status: 'success' | 'failure'
    error?: string
  }
]

export const browser = browserEventListener<OnAfterPlayback>()
export const main = mainEventListener<OnAfterPlayback>()
