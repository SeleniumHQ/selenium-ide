import browserEventListener from 'browser/api/classes/EventListener'
import mainEventListener from 'main/api/classes/EventListener'

export type TestID = string
export type StepID = string
export type OnStepCompletePlayback = [TestID, StepID]

export const browser = browserEventListener<OnStepCompletePlayback>()
export const main = mainEventListener<OnStepCompletePlayback>()
