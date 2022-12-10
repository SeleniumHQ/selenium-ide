import { loadingID } from '../../constants/loadingID'
import { CoreSessionData, Mutator } from '../../types'

/**
 * Loads the project editor for a path
 */
export type Shape = (filepath: string) => Promise<CoreSessionData | null>

export const mutator: Mutator<Shape> = (session, { result }) => {
  if (!result) {
    return session
  }
  // result.state = defaultState
  const { project, state } = result
  if (state) {
    return result
  }
  const activeTestID = project.tests[0]?.id ?? loadingID
  return {
    project,
    state: {
      ...session.state,
      activeSuiteID: '',
      activeTestID,
    },
  }
}
