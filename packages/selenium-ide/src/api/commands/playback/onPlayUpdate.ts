import set from 'lodash/fp/set'
import { PlaybackEventShapes } from '@seleniumhq/side-runtime'
import { CoreSessionData, EventMutator } from 'api/types'
import browserEventListener from 'browser/api/classes/EventListener'
import mainEventListener from 'main/api/classes/EventListener'

export type TestID = string
export type StepID = string
export type OnPlayUpdatePlayback = [
  PlaybackEventShapes['PLAYBACK_STATE_CHANGED']
]

const playStatusFromPlaybackState: Record<
  PlaybackEventShapes['PLAYBACK_STATE_CHANGED']['state'],
  CoreSessionData['state']['status']
> = {
  'aborted': 'paused',
  'breakpoint': 'paused',
  'errored': 'paused',
  'failed': 'paused',
  'finished': 'idle',
  'paused': 'paused',
  'playing': 'playing',
  'prep': 'playing',
  'stopped': 'idle',
}

export const mutator: EventMutator<OnPlayUpdatePlayback> = (session, [data]) =>
  set(['state', 'status'], playStatusFromPlaybackState[data.state], session)

export const browser = browserEventListener<OnPlayUpdatePlayback>()
export const main = mainEventListener<OnPlayUpdatePlayback>()
