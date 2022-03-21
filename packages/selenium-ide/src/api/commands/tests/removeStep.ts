import { CommandShape, TestShape } from '@seleniumhq/side-model'
import browserHandler from 'browser/api/classes/Handler'
import set from 'lodash/fp/set'
import update from 'lodash/fp/update'
import mainHandler, { passthrough } from 'main/api/classes/Handler'
import { Mutator } from 'api/types'
import { getActiveCommandIndex } from 'api/helpers/getActiveData'
import { hasID } from 'api/helpers/hasID'

export type Shape = (testID: string, stepID: string) => Promise<void>

export const mutator: Mutator<Shape> = (
  session,
  { params: [testID, stepID] }
) => {
  const {
    project: { tests },
  } = session
  const testIndex = tests.findIndex(hasID(testID))
  const activeTest = tests[testIndex]
  const commandIndex = getActiveCommandIndex(session, activeTest)
  const sessionWithRemovedCommand = update(
    'project.tests',
    (tests: TestShape[]) => {
      return update(
        `${testIndex}.commands`,
        (commands: CommandShape[]) =>
          commands.filter((cmd) => cmd.id !== stepID),
        tests
      )
    },
    session
  )
  const newActiveTest = sessionWithRemovedCommand.project.tests[testIndex]
  return set(
    'state.activeCommandID',
    newActiveTest.commands[
      Math.min(newActiveTest.commands.length - 1, commandIndex)
    ].id,
    sessionWithRemovedCommand
  )
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>(passthrough)
