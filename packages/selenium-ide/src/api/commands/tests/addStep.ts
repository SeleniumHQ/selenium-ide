import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { Mutator, TestShape } from 'api/types'

export type Shape = Session['tests']['addStep']

export const browser = browserHandler<Shape>()

export const mutator: Mutator<Shape> = (
  session,
  { params: [testID, index] }
) => {
  const test = session.project.tests.find(
    (test) => test.id === testID
  ) as TestShape
  test.commands.splice(index, 0)
}

export const main = mainHandler<Shape>()
