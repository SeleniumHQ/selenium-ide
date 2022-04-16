import { CommandShape } from '@seleniumhq/side-model'
import update from 'lodash/fp/update'
import { CoreSessionData, Mutator } from 'api/types'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler, { passthrough } from 'main/api/classes/Handler'
import { hasID } from 'api/helpers/hasID'

export type Shape = (testID: string, newIndex: number) => Promise<void>

export const mutator: Mutator<Shape> = (
  session: CoreSessionData,
  { params: [testID, newIndex] }
) => {
  const ids = session.state.editor.selectedCommands
  const included = (bool: boolean) => (cmd: CommandShape) =>
    bool === ids.includes(cmd.id)
  const testIndex = session.project.tests.findIndex(hasID(testID))
  return update(
    `project.tests.${testIndex}.commands`,
    (cmds: CommandShape[]) => {
      const untouchedCmds = cmds.filter(included(false))
      const movedCmds = cmds.filter(included(true))
      untouchedCmds.splice(newIndex, 0, ...movedCmds)
      return untouchedCmds
    },
    session
  )
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>(passthrough)
