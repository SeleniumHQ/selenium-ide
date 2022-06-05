import set from 'lodash/fp/set'
import { defaultPlaybackState } from '../../models'
import { Mutator } from '../../types'

/**
 * Start running a test suite. Results should be processed using
 * onStepUpdate and onPlayUpdate.
 */
export type Shape = () => Promise<void>

export const mutator: Mutator = (session) =>
  set(
    'state.playback',
    defaultPlaybackState,
    set('state.status', 'playing', session)
  )
