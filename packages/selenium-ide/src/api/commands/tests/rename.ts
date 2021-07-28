import { CoreSessionData, TestShape } from 'api/types'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'

export type Shape = Session['tests']['rename']

export const mutator = (
  session: CoreSessionData,
  testID: string,
  name: string
) => {
  const test = session.project.tests.find(
    (test) => test.id === testID
  ) as TestShape
  test.name = name
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
