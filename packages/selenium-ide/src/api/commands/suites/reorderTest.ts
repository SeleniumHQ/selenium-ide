import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { Mutator, SuiteShape } from 'api/types'

export type Shape = Session['suites']['reorderTest']

export const mutator: Mutator<Shape> = (
  { project },
  { params: [suiteID, testID, newIndex] }
) => {
  const { suites } = project
  const suite = suites.find((suite) => suite.id === suiteID) as SuiteShape
  const prevIndex = suite.tests.indexOf(testID)
  suite.tests.splice(prevIndex, 1)
  suite.tests.splice(newIndex, 0, testID)
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
