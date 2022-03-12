import { CommandShape, TestShape } from '@seleniumhq/side-model'
import set from 'lodash/fp/set'
import update from 'lodash/fp/update'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { Mutator } from 'api/types'

export type Shape = Session['tests']['addStep']

export const browser = browserHandler<Shape>()

export const mutator: Mutator<Shape> = (
  session,
  { params: [testID, index], result }
) => {
  const sessionWithNewCommand = update(
    'project.tests',
    (tests: TestShape[]) => {
      const testIndex = tests.findIndex((test) => test.id === testID)
      return update(
        `${testIndex}.commands`,
        (commands: CommandShape[]) => {
          const commandsWithNewEntry = commands.slice(0)
          commandsWithNewEntry.splice(index + 1, 0, result);
          return commandsWithNewEntry
        },
        tests
      )
    },
    session
  )
  return set('state.activeCommandID', result.id, sessionWithNewCommand)
}

export const main = mainHandler<Shape>()
