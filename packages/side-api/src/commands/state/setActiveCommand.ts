import merge from 'lodash/fp/merge'
import { Mutator } from '../../types'
import { EditorStateShape, PlaybackStateShape } from '../../models/state'
import { getCommandIndex } from '../../helpers/getActiveData'

/**
 * Sets the active command for the test editor
 */
export type Shape = (commandID: string) => Promise<boolean>

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
      selectedCommandIndexes: [index],
    },
    playback: {
      currentIndex: index,
    },
  }
  return merge(session, { state: stateUpdates })
}
