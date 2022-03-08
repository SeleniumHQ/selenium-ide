import browserEventListener from 'browser/api/classes/EventListener'
import mainEventListener from 'main/api/classes/EventListener'

export type onToggleSelectModeRecorder = [
  boolean
]

export const browser = browserEventListener<onToggleSelectModeRecorder>()
export const main = mainEventListener<onToggleSelectModeRecorder>()
