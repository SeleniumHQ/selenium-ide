import { SuiteShape } from '@seleniumhq/side-model'
import { loadingID } from '../../constants/loadingID'
import { CoreSessionData, Mutator } from '../../types'

/**
 * Loads the project editor for a path
 */
export type Shape = (filepath: string) => Promise<CoreSessionData | null>

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
  return {
    project,
    state: {
      ...session.state,
      activeSuiteID,
      activeTestID,
    },
  }
}
