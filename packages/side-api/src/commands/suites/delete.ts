import update from 'lodash/fp/update'
import { hasID, notHasID } from '../../helpers/hasID'
import { CoreSessionData, Mutator } from '../../types'

/**
 * Deletes the selected suite
 */
export type Shape = (suiteID: string) => Promise<void>

export const mutator: Mutator<Shape> = (session, { params: [suiteID] }) => {
  const sessionWithoutSuite: CoreSessionData = update(
    'project.suites',
    (suites) => suites.filter(notHasID(suiteID)),
    session
  )
  const oldSuites = session.project.suites
  const suiteIndex = oldSuites.findIndex(hasID(suiteID))
  const newSuiteIndex = Math.min(suiteIndex, oldSuites.length - 2)
  const newActiveSuite = sessionWithoutSuite.project.suites[newSuiteIndex]
  return {
    ...sessionWithoutSuite,
    state: {
      ...sessionWithoutSuite.state,
      activeSuiteID: newActiveSuite.id,
    },
  }
}
