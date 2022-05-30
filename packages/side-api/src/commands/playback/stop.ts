import set from 'lodash/fp/set'
import { Mutator } from '../../types'

/**
 * Abort a test. Can not be resumed
 */
export type Shape = () => Promise<void>

const setToIdle = set('state.status', 'idle')
export const mutator: Mutator<Shape> = setToIdle
