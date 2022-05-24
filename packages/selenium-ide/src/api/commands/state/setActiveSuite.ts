import browserHandler from 'browser/api/classes/Handler'
import mainHandler, { passthrough } from 'main/api/classes/Handler'
import { Mutator } from 'api/types'
import { mutator as setActiveTest } from './setActiveTest'

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

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>(passthrough)
