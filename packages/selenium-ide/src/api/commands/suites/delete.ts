import { hasID, notHasID } from 'api/helpers/hasID'
import { CoreSessionData, Mutator } from 'api/types'
import browserHandler from 'browser/api/classes/Handler'
import update from 'lodash/fp/update'
import mainHandler, { passthrough } from 'main/api/classes/Handler'

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

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>(passthrough)
