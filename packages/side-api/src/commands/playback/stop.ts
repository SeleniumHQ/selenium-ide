import set from 'lodash/fp/set'
import { badIndex } from '../../constants'
import { Mutator } from '../../types/base'

/**
 * Abort a test. Can not be resumed
 */
export type Shape = () => Promise<void>

const setPlaybackToBadIndex = set('state.playback.currentIndex', badIndex)
const setToIdle = set('state.status', 'idle')
export const mutator: Mutator<Shape> = (session) =>
  setPlaybackToBadIndex(setToIdle(session))
