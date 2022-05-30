import { CommandShape, TestShape } from '@seleniumhq/side-model'
import update from 'lodash/fp/update'
import { mutator as updateStepSelection } from '../state/updateStepSelection'
import { state } from '../../models'
import { hasID } from '../../helpers/hasID'
import { Mutator } from '../../types'

/**
 * Append steps at the chosen index in the selected test
 */
export type Shape = (
  testID: string,
  index: number,
  stepFields: Partial<CommandShape>[]
) => Promise<CommandShape[]>

export const mutator: Mutator<Shape> = (
  session,
  { params: [testID, index], result }
) => {
  const sessionWithNewCommands = update(
    'project.tests',
    (tests: TestShape[]) => {
      const testIndex = tests.findIndex(hasID(testID))
      return update(
        `${testIndex}.commands`,
        (commands: CommandShape[]) => {
          const commandsWithNewEntry = commands.slice(0)
          let insertIndex = index
          if (state.userPrefs.insertCommandPref === 'After')
            insertIndex = insertIndex + 1
          commandsWithNewEntry.splice(insertIndex, 0, ...result)

          return commandsWithNewEntry
        },
        tests
      )
    },
    session
  )
  return updateStepSelection(sessionWithNewCommands, {
    params: [index + result.length, false, false, true],
    result: undefined,
  })
}
