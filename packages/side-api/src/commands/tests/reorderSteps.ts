import { CommandShape } from '@seleniumhq/side-model'
import set from 'lodash/fp/set'
import update from 'lodash/fp/update'
import { hasID } from '../../helpers/hasID'
import {
  recalculateSelectedIndexes,
  reorderListRaw,
} from '../../helpers/reorderList'
import { CoreSessionData, Mutator } from '../../types'

/**
 * Reorder the selected steps in a test
 */
export type Shape = (testID: string, newIndex: number) => Promise<void>

export const mutator: Mutator<Shape> = (
  session: CoreSessionData,
  { params: [testID, newIndex] }
) => {
  const testIndex = session.project.tests.findIndex(hasID(testID))
  const newSession = update(
    `project.tests.${testIndex}.commands`,
    (cmds: CommandShape[]) => {
      const reorderedList = reorderListRaw({
        entries: cmds,
        newIndex,
        selectedIndexes: session.state.editor.selectedCommandIndexes,
      })
      return reorderedList
    },
    session
  )
  return set(
    'state.editor.selectedCommandIndexes',
    recalculateSelectedIndexes({
      newIndex,
      selectedIndexes: session.state.editor.selectedCommandIndexes,
    }),
    newSession
  )
}
