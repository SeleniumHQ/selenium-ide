import { SuiteShape } from '@seleniumhq/side-model'
import update from 'lodash/fp/update'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { Mutator } from 'api/types'

export type Shape = Session['suites']['reorderTest']

export const mutator: Mutator<Shape> = (
  session,
  { params: [suiteID, testID, newIndex] }
) =>
  update(
    'project.suites',
    (suites: SuiteShape[]) => {
      const suiteIndex = suites.findIndex((suite) => suite.id === suiteID)
      return update(`${suiteIndex}.tests`, (tests: SuiteShape['tests']) => {
        const newTests = tests.filter((id) => id !== testID)
        newTests.splice(newIndex, 0, testID)
        return newTests
      })
    },
    session
  )

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
