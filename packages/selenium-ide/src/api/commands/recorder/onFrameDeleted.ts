import browserEventListener from 'browser/api/classes/EventListener'
import mainEventListener from 'main/api/classes/EventListener'

export type OnFrameDeletedRecorder = []

export const browser = browserEventListener<OnFrameDeletedRecorder>()
export const main = mainEventListener<OnFrameDeletedRecorder>()
