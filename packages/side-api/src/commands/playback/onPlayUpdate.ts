import { PlaybackEventShapes } from '@seleniumhq/side-runtime'
import {
  BaseListener,
  CoreSessionData,
  EventMutator,
  StateShape,
} from '../../types/base'
import { badIndex } from '../../constants/badIndex'

/**
 * Runs whenever a test begins, ends, pauses, or errors
 */
export type Shape = BaseListener<OnPlayUpdatePlayback>

export type TestID = string
export type StepID = string
export type OnPlayUpdatePlayback = [
  {
    intermediate?: boolean
    state: PlaybackEventShapes['PLAYBACK_STATE_CHANGED']['state']
    testID?: string
  }
]

const testResultStatusFromPlaybackState: Record<
  PlaybackEventShapes['PLAYBACK_STATE_CHANGED']['state'],
  CoreSessionData['state']['playback']['testResults'][string]['state']
> = {
  aborted: 'skipped',
  breakpoint: 'pending',
  errored: 'errored',
  failed: 'failed',
  finished: 'passed',
  paused: 'skipped',
  playing: 'executing',
  prep: 'executing',
  stopped: 'skipped',
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
      testResults: {
        ...oldState.playback.testResults,
      },
    },
  }
  if (data.testID) {
    state.playback.testResults[data.testID] = {
      ...state.playback.testResults[data.testID],
      state: testResultStatusFromPlaybackState[data.state],
    }
  }
  if (!data.intermediate) {
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
  }
  return {
    ...session,
    state,
  }
}
