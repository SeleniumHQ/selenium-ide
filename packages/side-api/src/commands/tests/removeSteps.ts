import { CommandShape } from '@seleniumhq/side-model'
import update from 'lodash/fp/update'
import { Mutator } from '../../types'
import { hasID } from '../../helpers/hasID'

/**
 * Remove the chosen indexes from a test
 */
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
    (selectedCommandIndexes: number[]): number[] => {
      {
        const filteredCommands = selectedCommandIndexes.filter(
          (index) => !stepIndexes.includes(index)
        )
        if (filteredCommands.length) {
          return filteredCommands
        }
        return [Math.max(selectedCommandIndexes.slice(-1)[0] - 1, 0)]
      }
    },
    sessionWithRemovedCommands
  )
}
