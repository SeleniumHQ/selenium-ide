import update from 'lodash/fp/update'
import { hasID, notHasID } from '../../helpers/hasID'
import { CoreSessionData, Mutator } from '../../types'

/**
 * Delete the selected test
 */
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
