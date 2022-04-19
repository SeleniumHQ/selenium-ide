import { CommandShape } from '@seleniumhq/side-model'
import update from 'lodash/fp/update'
import { CoreSessionData, Mutator } from 'api/types'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler, { passthrough } from 'main/api/classes/Handler'
import { hasID } from 'api/helpers/hasID'
import { reorderListRaw } from 'api/helpers/reorderList'

export type Shape = (testID: string, newIndex: number) => Promise<void>

export const mutator: Mutator<Shape> = (
  session: CoreSessionData,
  { params: [testID, newIndex] }
) => {
  const testIndex = session.project.tests.findIndex(hasID(testID))
  return update(
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
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>(passthrough)
