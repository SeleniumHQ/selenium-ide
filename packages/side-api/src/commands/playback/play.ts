import set from 'lodash/fp/set'
import { Mutator } from '../../types'

/**
 * Start a running test, using a range to optionally control start
 * and end index
 */
export type Shape = (
  testID: string,
  playRange: [number, number]
) => Promise<void>

const setToPlay = set('state.status', 'playing')
export const mutator: Mutator<Shape> = (session) => setToPlay(session)
