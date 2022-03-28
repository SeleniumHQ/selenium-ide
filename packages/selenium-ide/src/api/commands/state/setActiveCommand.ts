import merge from 'lodash/fp/merge'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { Mutator, StateShape } from 'api/types'
import { PlaybackStateShape } from 'api/models/state'
import { getCommandIndex } from 'api/helpers/getActiveData'

export type Shape = Session['state']['setActiveCommand']

export type StateUpdates = Pick<StateShape, 'activeCommandID'> & {
  playback: Pick<PlaybackStateShape, 'currentIndex'>
}

export const mutator: Mutator<Shape> = (
  session,
  { params: [activeCommandID] }
) => {
  const stateUpdates: StateUpdates = {
    activeCommandID,
    playback: {
      currentIndex: getCommandIndex(session, activeCommandID),
    },
  }
  return merge(session, { state: stateUpdates })
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
