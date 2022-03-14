import browserEventListener from 'browser/api/classes/EventListener'
import mainEventListener from 'main/api/classes/EventListener'

export type OnSelectElementRecorder = [
  [string, string][]
]

export const browser = browserEventListener<OnSelectElementRecorder>()
export const main = mainEventListener<OnSelectElementRecorder>()
