import { LocatorFields } from 'api/types'
import browserEventListener from 'browser/api/classes/EventListener'
import mainEventListener from 'main/api/classes/EventListener'

export type OnRequestSelectElementRecorder = [
  boolean,
  LocatorFields
]

export const browser = browserEventListener<OnRequestSelectElementRecorder>()
export const main = mainEventListener<OnRequestSelectElementRecorder>()
