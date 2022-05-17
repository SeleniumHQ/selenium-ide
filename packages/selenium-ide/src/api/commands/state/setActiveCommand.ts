import merge from 'lodash/fp/merge'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { Mutator } from 'api/types'
import { EditorStateShape, PlaybackStateShape } from 'api/models/state'
import { getCommandIndex } from 'api/helpers/getActiveData'

export type Shape = Session['state']['setActiveCommand']

export type StateUpdates = {
  editor: Pick<EditorStateShape, 'selectedCommandIndexes'>
  playback: Pick<PlaybackStateShape, 'currentIndex'>
}

export const mutator: Mutator<Shape> = (
  session,
  { params: [activeCommandID] }
) => {
  const index = getCommandIndex(session, activeCommandID)
  const stateUpdates: StateUpdates = {
    editor: {
      selectedCommandIndexes: [index]
    },
    playback: {
      currentIndex: index,
    },
  }
  return merge(session, { state: stateUpdates })
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
