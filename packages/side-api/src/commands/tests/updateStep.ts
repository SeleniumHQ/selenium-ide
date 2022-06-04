import { CommandShape } from '@seleniumhq/side-model'
import merge from 'lodash/fp/merge'
import update from 'lodash/fp/update'
import { getCommandIndex } from '../../helpers/getActiveData'
import { hasID } from '../../helpers/hasID'
import { CoreSessionData, Mutator } from '../../types'

/**
 * Update the shape of a command
 */
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
