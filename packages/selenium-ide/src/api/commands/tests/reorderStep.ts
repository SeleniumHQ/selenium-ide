import { CoreSessionData, TestShape } from 'api/types'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'

export type Shape = Session['tests']['reorderStep']

export const mutator = (
  session: CoreSessionData,
  testID: string,
  stepID: string,
  newIndex: number
) => {
  const test = session.project.tests.find(
    (test) => test.id === testID
  ) as TestShape
  const index = test.commands.findIndex((step) => step.id === stepID)
  const [step] = test.commands.splice(index, 1)
  test.commands.splice(newIndex, 0, step)
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
