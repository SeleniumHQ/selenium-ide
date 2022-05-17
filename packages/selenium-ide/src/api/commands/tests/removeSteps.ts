import { CommandShape } from '@seleniumhq/side-model'
import browserHandler from 'browser/api/classes/Handler'
import update from 'lodash/fp/update'
import mainHandler, { passthrough } from 'main/api/classes/Handler'
import { Mutator } from 'api/types'
import { hasID } from 'api/helpers/hasID'

export type Shape = (testID: string, stepIndexes: number[]) => Promise<void>

export const mutator: Mutator<Shape> = (
  session,
  { params: [testID, stepIndexes] }
) => {
  const {
    project: { tests },
  } = session
  const testIndex = tests.findIndex(hasID(testID))
  const sessionWithRemovedCommands = update(
    `project.tests.${testIndex}.commands`,
    (commands: CommandShape[]) =>
      commands.filter((_cmd, index) => !stepIndexes.includes(index)),
    session
  )
  return update(
    `state.editor.selectedCommandIndexes`,
    (selectedCommandIndexes: number[]) => {
      const filteredCommands = selectedCommandIndexes.filter(
        (_id, index) => !stepIndexes.includes(index)
      );
      if (filteredCommands.length) {
        return filteredCommands
      }
      return Math.max(selectedCommandIndexes.slice(-1)[0] - 1, 0)
    },
    sessionWithRemovedCommands
  )
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>(passthrough)
