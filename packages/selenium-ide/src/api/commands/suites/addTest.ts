import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { Mutator, SuiteShape } from 'api/types'

export type Shape = Session['suites']['addTest']

export const mutator: Mutator<Shape> = (
  session,
  { params: [suiteID, testID] }
) => {
  const suite = session.project.suites.find(
    (suite) => suite.id == suiteID
  ) as SuiteShape
  suite.tests.push(testID)
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
