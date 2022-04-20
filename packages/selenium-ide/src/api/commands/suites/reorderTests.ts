import set from 'lodash/fp/set'
import update from 'lodash/fp/update'
import { Mutator } from 'api/types'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler, { passthrough } from 'main/api/classes/Handler'
import { hasID } from 'api/helpers/hasID'
import {
  recalculateSelectedIndexes,
  reorderListRaw,
} from 'api/helpers/reorderList'

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

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>(passthrough)
