import set from 'lodash/fp/set'
import { Mutator } from '../../types'

/**
 * Start running a test suite. Results should be processed using
 * onStepUpdate and onPlayUpdate.
 */
export type Shape = () => Promise<void>

const setToPlay = set('state.status', 'playing')
export const mutator: Mutator<Shape> = (session) => setToPlay(session)
