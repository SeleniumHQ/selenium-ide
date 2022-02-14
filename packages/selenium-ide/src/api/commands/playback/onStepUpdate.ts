import set from 'lodash/fp/set'
import { PlaybackEventShapes } from '@seleniumhq/side-runtime'
import { EventMutator } from 'api/types'
import browserEventListener from 'browser/api/classes/EventListener'
import mainEventListener from 'main/api/classes/EventListener'

export type TestID = string
export type StepID = string
export type OnStepUpdatePlayback = [
  PlaybackEventShapes['COMMAND_STATE_CHANGED']
]

export const mutator: EventMutator<OnStepUpdatePlayback> = (session, [data]) =>
  set(['state', 'playback', 'commands', data.id], data.state, session)

export const browser = browserEventListener<OnStepUpdatePlayback>()
export const main = mainEventListener<OnStepUpdatePlayback>()
