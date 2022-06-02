import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { Mutator } from 'api/types'
import loadingID from 'api/constants/loadingID'
import { SuiteShape } from '@seleniumhq/side-model'

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
  const { project, state } = result
  if (state) {
    return result
  }
  const firstSuite = project.suites?.[0] ?? defaultSuite
  const activeSuiteID = firstSuite.id
  const activeTestID = firstSuite.tests[0] ?? loadingID
  return {
    project,
    state: {
      ...session.state,
      activeSuiteID,
      activeTestID,
    },
  }
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
