import browserEventListener from 'browser/api/classes/EventListener'
import mainEventListener from 'main/api/classes/EventListener'

export type OnFrameRecalculateRecorder = []

export const browser = browserEventListener<OnFrameRecalculateRecorder>()
export const main = mainEventListener<OnFrameRecalculateRecorder>()
