import set from 'lodash/fp/set'
import { Mutator } from '../../types'

/**
 * Stop recording interactions across playback windows
 */
export type Shape = () => Promise<void>

const setToIdle = set('state.status', 'idle')
export const mutator: Mutator<Shape> = (session) => setToIdle(session)
