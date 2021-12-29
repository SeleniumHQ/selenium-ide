import set from 'lodash/fp/set'
import update from 'lodash/fp/update'
import { CoreSessionData, Mutator, TestShape } from 'api/types'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'

export type Shape = Session['tests']['rename']

export const mutator: Mutator<Shape> = (
  session: CoreSessionData,
  { params: [testID, name] }
) =>
  update(
    'project.tests',
    (tests: TestShape[]) => {
      const testIndex = tests.findIndex((test) => test.id === testID)
      return set(`${testIndex}.name`, name, tests)
    },
    session
  )

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
