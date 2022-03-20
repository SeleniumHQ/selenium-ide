import browserEventListener from 'browser/api/classes/EventListener'
import mainEventListener from 'main/api/classes/EventListener'

export type OnRequestSelectElementRecorder = [
  boolean,
  'target' | 'value'
]

export const browser = browserEventListener<OnRequestSelectElementRecorder>()
export const main = mainEventListener<OnRequestSelectElementRecorder>()
