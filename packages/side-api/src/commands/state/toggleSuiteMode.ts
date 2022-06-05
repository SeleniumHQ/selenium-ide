import set from 'lodash/fp/set'
import { EditorStateShape } from '../../models'
import { Mutator } from '../../types'

/**
 * Toggles breakpoints in the active test
 */
export type Shape = (suiteMode: EditorStateShape['suiteMode']) => Promise<void>

export const mutator: Mutator<Shape> = (session, { params: [suiteMode] }) =>
  set('state.editor.suiteMode', suiteMode, session)
