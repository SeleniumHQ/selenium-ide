import { PlaybackEventShapes } from '@seleniumhq/side-runtime'
import { getCommandIndex } from 'api/helpers/getActiveData'
import { EventMutator, StateShape } from 'api/types'
import browserEventListener from 'browser/api/classes/EventListener'
import merge from 'lodash/fp/merge'
import mainEventListener from 'main/api/classes/EventListener'
import { PlaybackStateShape } from 'api/models/state'

export type OnStepUpdatePlayback = [
  PlaybackEventShapes['COMMAND_STATE_CHANGED']
]

export type StateUpdateShape = Partial<Omit<StateShape, 'playback'>> & {
  playback: Partial<PlaybackStateShape>
}

export const mutator: EventMutator<OnStepUpdatePlayback> = (
  session,
  [data]
) => {
  const stateUpdates: StateUpdateShape = {
    playback: {
      commands: { [data.id]: data },
    },
  }
  if (data.state === 'executing') {
    stateUpdates.playback.currentIndex = getCommandIndex(session, data.id)
    stateUpdates.activeCommandID = data.id
  }
  return merge(session, { state: stateUpdates })
}

export const browser = browserEventListener<OnStepUpdatePlayback>()
export const main = mainEventListener<OnStepUpdatePlayback>()
