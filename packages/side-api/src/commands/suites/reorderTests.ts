import set from 'lodash/fp/set'
import update from 'lodash/fp/update'
import { Mutator } from '../../types'
import { hasID } from '../../helpers/hasID'
import {
  recalculateSelectedIndexes,
  reorderListRaw,
} from '../../helpers/reorderList'

/**
 * Changes the order of tests in the active suite
 */
export type Shape = (testID: string, newIndex: number) => Promise<void>

export const mutator: Mutator<Shape> = (
  session,
  { params: [suiteID, newIndex] }
) => {
  const suiteIndex = session.project.suites.findIndex(hasID(suiteID))
  const newSession = update(
    `project.suites.${suiteIndex}.tests`,
    (tests: string[]) => {
      return reorderListRaw({
        entries: tests,
        newIndex,
        selectedIndexes: session.state.editor.selectedTestIndexes,
      })
    },
    session
  )
  return set(
    'state.editor.selectedTestIndexes',
    recalculateSelectedIndexes({
      newIndex,
      selectedIndexes: session.state.editor.selectedTestIndexes,
    }),
    newSession
  )
}
