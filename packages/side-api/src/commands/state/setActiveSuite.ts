import { Mutator } from '../../types'
import { mutator as setActiveTest } from './setActiveTest'

/**
 * Sets the active suite for the project
 */
export type Shape = (suiteID: string) => Promise<void>

export const mutator: Mutator<Shape> = (
  session,
  { params: [activeSuiteID] }
) => {
  const { suites } = session.project
  const activeSuite =
    suites.find((suite) => suite.id === activeSuiteID) || suites[0]
  return setActiveTest(
    { ...session, state: { ...session.state, activeSuiteID } },
    {
      params: [activeSuite.tests[0]],
      result: undefined,
    }
  )
}
