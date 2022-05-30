import { CommandShape, TestShape } from '@seleniumhq/side-model'
import update from 'lodash/fp/update'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { Mutator } from 'api/types'
import { hasID } from 'api/helpers/hasID'
import { mutator as updateStepSelection } from '../state/updateStepSelection'

export type Shape = Session['tests']['addSteps']

export const browser = browserHandler<Shape>()

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
          const insertIndex =
            session.state.userPrefs.insertCommandPref === 'After'
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
    params: [index + result.length, false, false, true],
    result: undefined
  })
}

export const main = mainHandler<Shape>()
