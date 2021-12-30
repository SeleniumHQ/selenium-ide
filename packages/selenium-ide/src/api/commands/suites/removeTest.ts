import { SuiteShape } from '@seleniumhq/side-model'
import update from 'lodash/fp/update'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { Mutator } from 'api/types'

export type Shape = Session['suites']['removeTest']
export const mutator: Mutator<Shape> = (
  session,
  { params: [suiteID, testID] }
) =>
  update(
    'project.suites',
    (suites: SuiteShape[]) => {
      const suiteIndex = suites.findIndex((suite) => suite.id === suiteID)
      return update(`${suiteIndex}.tests`, (tests: SuiteShape['tests']) =>
        tests.filter((id) => id !== testID)
      )
    },
    session
  )

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
