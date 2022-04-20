import { CommandShape } from '@seleniumhq/side-model'
import set from 'lodash/fp/set'
import update from 'lodash/fp/update'
import { CoreSessionData, Mutator } from 'api/types'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler, { passthrough } from 'main/api/classes/Handler'
import { hasID } from 'api/helpers/hasID'
import { recalculateSelectedIndexes, reorderListRaw } from 'api/helpers/reorderList'

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

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>(passthrough)
