// import defaultState from 'api/models/state'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { Mutator } from 'api/types'
import loadingID from 'api/constants/loadingID'
import { SuiteShape } from '@seleniumhq/side-model'
import { hasID } from 'api/helpers/hasID'

export type Shape = Session['projects']['load']

const defaultSuite: Partial<SuiteShape> = {
  id: loadingID,
  name: 'Default',
  tests: [loadingID],
}
export const mutator: Mutator<Shape> = (session, { result }) => {
  if (!result) {
    return session
  }
  // result.state = defaultState
  const { project, state } = result
  if (state) {
    return result
  }
  const firstSuite = project.suites?.[0] ?? defaultSuite
  const activeSuiteID = firstSuite.id
  const activeTestID = firstSuite.tests[0] ?? loadingID
  const activeCommandID =
    project.tests.find(hasID(activeTestID))?.commands?.[0]?.id ?? loadingID
  return {
    project,
    state: {
      ...session.state,
      activeSuiteID,
      activeTestID,
      activeCommandID,
    },
  }
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
