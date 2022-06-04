import update from 'lodash/fp/update'
import { Mutator } from '../../types'
import { getActiveTest } from '../../helpers/getActiveData'
import { updateSelection } from '../../helpers/updateSelection'

/**
 * Changes the selected steps. Meant to be instrumented from the
 * active test command list using shift keys and all that.
 */
export type Shape = (
  commandIndex: number,
  batch: boolean,
  add: boolean,
  clear: boolean
) => Promise<void>

export const mutator: Mutator<Shape> = (session, { params }) => {
  const activeTest = getActiveTest(session)
  return update(
    `state.editor.selectedCommandIndexes`,
    (indexes: number[]) =>
      updateSelection(
        activeTest.commands.map((_cmd, index) => index),
        indexes,
        indexes.slice(-1)[0],
        params
      ),
    session
  )
}
