import { EditorStateShape } from '../../models/state'
import { Mutator } from '../../types'

/**
 * Removes selected command indexes. Called when test editor closes.
 */
export type Shape = () => Promise<void>
export type EditorUpdates = Pick<EditorStateShape, 'selectedCommandIndexes'>
export type StateUpdates = { editor: EditorUpdates }

export const mutator: Mutator = (session) => session
