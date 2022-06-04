import { EditorStateShape } from '../../models/state'
import { Mutator } from '../../types'
import set from 'lodash/fp/set'

/**
 * Removes selected command indexes. Called when test editor closes.
 */
export type Shape = () => Promise<void>
export type EditorUpdates = Pick<EditorStateShape, 'selectedCommandIndexes'>
export type StateUpdates = { editor: EditorUpdates }

export const mutator: Mutator = (session) =>
  set('state.editor.selectedCommandIndexes', [], session)
