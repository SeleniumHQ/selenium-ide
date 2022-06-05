import { PlaybackEventShapes } from '@seleniumhq/side-runtime'
import {
  BaseListener,
  CoreSessionData,
  EventMutator,
  StateShape,
} from '../../types'
import { badIndex } from '../../constants/badIndex'

/**
 * Runs whenever a test begins, ends, pauses, or errors
 */
export type Shape = BaseListener<OnPlayUpdatePlayback>

export type TestID = string
export type StepID = string
export type OnPlayUpdatePlayback = [
  PlaybackEventShapes['PLAYBACK_STATE_CHANGED']
]

const playStatusFromPlaybackState: Record<
  PlaybackEventShapes['PLAYBACK_STATE_CHANGED']['state'],
  CoreSessionData['state']['status']
> = {
  aborted: 'paused',
  breakpoint: 'paused',
  errored: 'paused',
  failed: 'paused',
  finished: 'idle',
  paused: 'paused',
  playing: 'playing',
  prep: 'playing',
  stopped: 'idle',
}

export const mutator: EventMutator<OnPlayUpdatePlayback> = (
  session,
  [data]
) => {
  const oldState = session.state
  const state: StateShape = {
    ...oldState,
    playback: {
      ...oldState.playback,
    },
    status: playStatusFromPlaybackState[data.state],
  }
  switch (data.state) {
    case 'paused':
    case 'breakpoint':
      state.status = 'paused'
      break
    case 'aborted':
    case 'errored':
    case 'failed':
    case 'finished':
    case 'stopped':
      state.status = 'idle'
      state.playback.currentIndex = badIndex
      break
  }
  return {
    ...session,
    state,
  }
}
