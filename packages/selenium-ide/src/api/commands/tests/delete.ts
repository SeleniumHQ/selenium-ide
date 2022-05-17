import { hasID, notHasID } from 'api/helpers/hasID'
import { CoreSessionData, Mutator } from 'api/types'
import browserHandler from 'browser/api/classes/Handler'
import update from 'lodash/fp/update'
import mainHandler, { passthrough } from 'main/api/classes/Handler'

export type Shape = (testID: string) => Promise<void>

export const mutator: Mutator<Shape> = (session, { params: [testID] }) => {
  const sessionWithoutTest: CoreSessionData = update(
    'project.tests',
    (tests) => tests.filter(notHasID(testID)),
    session
  )
  const sessionWithNoTestRefs: CoreSessionData = update(
    'project.suites',
    (suites) =>
      suites.map(
        update('tests', (tests: string[]) =>
          tests.filter((id) => id !== testID)
        )
      ),
    sessionWithoutTest
  )
  const oldTests = session.project.tests
  const testIndex = oldTests.findIndex(hasID(testID))
  const newTestIndex = Math.max(testIndex, 0)
  const newActiveTest = sessionWithNoTestRefs.project.tests[newTestIndex]
  return {
    ...sessionWithNoTestRefs,
    state: {
      ...sessionWithNoTestRefs.state,
      activeTestID: newActiveTest.id,
    },
  }
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>(passthrough)
