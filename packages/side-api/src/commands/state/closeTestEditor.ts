import { EditorStateShape } from '../../models/state'

/**
 * Removes selected command indexes. Called when test editor closes.
 */
export type Shape = () => Promise<void>
export type EditorUpdates = Pick<EditorStateShape, 'selectedCommandIndexes'>
export type StateUpdates = { editor: EditorUpdates }
