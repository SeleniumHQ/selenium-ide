import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { Mutator } from 'api/types'
import { SuiteShape } from 'api/models/project/suite'

export type Shape = Session['suites']['removeTest']
export const mutator: Mutator<Shape> = (
  session,
  { params: [suiteID, testID] }
) => {
  const { suites } = session.project
  const suite = suites.find((suite) => suite.id === suiteID) as SuiteShape
  const testIndex = suite.tests.indexOf(testID)
  suite.tests.splice(testIndex, 1)
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
