import update from 'lodash/fp/update'
import { Mutator } from 'api/types'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler, { passthrough } from 'main/api/classes/Handler'
import { hasID } from 'api/helpers/hasID'
import { reorderListRaw } from 'api/helpers/reorderList'

export type Shape = (testID: string, newIndex: number) => Promise<void>

export const mutator: Mutator<Shape> = (
  session,
  { params: [suiteID, newIndex] }
) => {
  const suiteIndex = session.project.suites.findIndex(hasID(suiteID))
  return update(
    `project.suites.${suiteIndex}.tests`,
    (tests: string[]) => {
      return reorderListRaw({
        entries: tests.map((t, index) => [t, index]),
        newIndex,
        selectedIndexes: session.state.editor.selectedTestIndexes,
      }).map((t) => t[0])
    },
    session
  )
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>(passthrough)
