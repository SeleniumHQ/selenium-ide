import { CommandShape } from '@seleniumhq/side-model'
import merge from 'lodash/fp/merge'
import update from 'lodash/fp/update'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler, { passthrough } from 'main/api/classes/Handler'
import { CoreSessionData, Mutator } from 'api/types'
import { hasID } from 'api/helpers/hasID'
import { getCommandIndex } from 'api/helpers/getActiveData'

export type Shape = (
  testID: string,
  stepID: string,
  step: Partial<CommandShape>
) => Promise<void>

export const mutator: Mutator<Shape> = (
  session: CoreSessionData,
  { params: [testID, stepID, step] }
) => {
  const testIndex = session.project.tests.findIndex(hasID(testID))
  const stepIndex = getCommandIndex(
    session,
    stepID,
    session.project.tests[testIndex]
  )
  const updatedSession = update(
    `project.tests[${testIndex}].commands[${stepIndex}]`,
    (command: CommandShape) => merge(command, step),
    session
  )
  return updatedSession
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>(passthrough)
