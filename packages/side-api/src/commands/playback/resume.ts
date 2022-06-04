import set from 'lodash/fp/set'
import { Mutator } from '../../types'

/**
 * Resume running a paused test
 */
export type Shape = () => Promise<void>

const setToPlay = set('state.status', 'playing')
export const mutator: Mutator<Shape> = (session) => setToPlay(session)
