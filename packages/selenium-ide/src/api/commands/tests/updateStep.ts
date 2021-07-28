import merge from 'lodash/fp/merge'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { CommandShape, CoreSessionData, TestShape } from 'api/types'

export type Shape = Session['tests']['updateStep']

export const mutator = (
  session: CoreSessionData,
  testID: string,
  stepID: string,
  step: Partial<CommandShape>
) => {
  const test = session.project.tests.find(
    (test) => test.id === testID
  ) as TestShape
  const index = test.commands.findIndex((step) => step.id === stepID)
  test.commands[index] = merge(test.commands[index], step)
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
