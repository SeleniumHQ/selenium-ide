import { PlaybackEventShapes } from '@seleniumhq/side-runtime'
import { CoreSessionData, EventMutator, StateShape } from 'api/types'
import browserEventListener from 'browser/api/classes/EventListener'
import mainEventListener from 'main/api/classes/EventListener'
import { defaultPlaybackState } from 'api/models/state'
import badIndex from 'api/constants/badIndex'

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
    case 'playing':
      if (session.state.playback.currentIndex === badIndex) {
        state.playback.commands = {}
      }
      break
    case 'prep':
      state.playback = defaultPlaybackState
      break
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

export const browser = browserEventListener<OnPlayUpdatePlayback>()
export const main = mainEventListener<OnPlayUpdatePlayback>()
