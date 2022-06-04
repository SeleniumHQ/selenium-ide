import update from 'lodash/fp/update'
import { Mutator } from '../../types'
import { getActiveSuite } from '../../helpers/getActiveData'
import { updateSelection } from '../../helpers/updateSelection'

/**
 * Changes the selected tests. Meant to be instrumented from the
 * suite editor using shift keys and all that.
 */
export type Shape = (
  testIndex: number,
  batch: boolean,
  add: boolean,
  clear: boolean
) => Promise<void>

export const mutator: Mutator<Shape> = (session, { params }) =>
  update(
    `state.editor.selectedTestIndexes`,
    (testIndexes: number[]) =>
      updateSelection(
        getActiveSuite(session).tests.map((_, index) => index),
        testIndexes,
        testIndexes.slice(-1)[0],
        params
      ),
    session
  )
