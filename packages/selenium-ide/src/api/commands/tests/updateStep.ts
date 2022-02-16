import { CommandShape } from '@seleniumhq/side-model'
import merge from 'lodash/fp/merge'
import update from 'lodash/fp/update'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { CoreSessionData, Mutator } from 'api/types'

export type Shape = Session['tests']['updateStep']

const hasID = (id: string) => (obj: { id: string }) => obj.id === id

export const mutator: Mutator<Shape> = (
  session: CoreSessionData,
  { params: [testID, stepID, step] }
) => {
  const testIndex = session.project.tests.findIndex(hasID(testID))
  const stepIndex = session.project.tests[testIndex].commands.findIndex(
    hasID(stepID)
  )
  console.log(session.project.tests[0].commands[0])
  const updatedSession = update(
    `project.tests[${testIndex}].commands[${stepIndex}]`,
    (command: CommandShape) => merge(command, step),
    session
  )
  console.log(updatedSession.project.tests[0].commands[0])
  return updatedSession
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
