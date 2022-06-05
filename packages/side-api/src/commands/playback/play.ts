import set from 'lodash/fp/set'
import { defaultPlaybackState } from '../../models'
import { Mutator } from '../../types'

/**
 * Start a running test, using a range to optionally control start
 * and end index
 */
export type Shape = (
  testID: string,
  playRange?: [number, number]
) => Promise<void>

export const mutator: Mutator = (session) =>
  set(
    'state.playback',
    defaultPlaybackState,
    set('state.status', 'playing', session)
  )
