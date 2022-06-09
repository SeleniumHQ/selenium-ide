import { CommandShape, TestShape } from '@seleniumhq/side-model'
import update from 'lodash/fp/update'
import { mutator as updateStepSelection } from '../state/updateStepSelection'
import { hasID } from '../../helpers/hasID'
import { Mutator } from '../../types'

/**
 * Append steps at the chosen index in the selected test
 */
export type Shape = (
  testID: string,
  index: number,
  stepFields?: Partial<CommandShape>[]
) => Promise<CommandShape[]>

export const mutator: Mutator<Shape> = (
  session,
  { params: [testID, index], result }
) => {
  const selectIndex =
    session.state.status === 'recording'
      ? index + 1
      : session.state.userPrefs.insertCommandPref === 'After'
      ? index + 1
      : index

  const sessionWithNewCommands = update(
    'project.tests',
    (tests: TestShape[]) => {
      const testIndex = tests.findIndex(hasID(testID))
      return update(
        `${testIndex}.commands`,
        (commands: CommandShape[]) => {
          const commandsWithNewEntry = commands.slice(0)
          const insertIndex =
            session.state.status === 'recording'
              ? index + 1
              : session.state.userPrefs.insertCommandPref === 'After'
              ? index + 1
              : index
          commandsWithNewEntry.splice(insertIndex, 0, ...result)
          return commandsWithNewEntry
        },
        tests
      )
    },
    session
  )
  return updateStepSelection(sessionWithNewCommands, {
    params: [selectIndex, false, false, true],
    result: undefined,
  })
}
