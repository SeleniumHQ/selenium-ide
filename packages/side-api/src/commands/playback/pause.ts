import set from 'lodash/fp/set'
import { Mutator } from '../../types'

/**
 * Pause a running test. Can be resumed.
 */
export type Shape = () => Promise<void>

const setToPaused = set('state.status', 'paused')
export const mutator: Mutator<Shape> = (session) => setToPaused(session)
