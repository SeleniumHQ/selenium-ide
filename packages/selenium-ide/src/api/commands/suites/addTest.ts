import update from 'lodash/fp/update'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { CoreSessionData, Mutator } from 'api/types'
import { hasID } from 'api/helpers/hasID'
import { TestShape } from '@seleniumhq/side-model'

export type Shape = (suiteID: string, testID: string, index: number) => Promise<TestShape>

export const mutator: Mutator<Shape> = (
  session,
  { params: [suiteID, testID, index] }
) =>
  update(
    'project.suites',
    (suites: CoreSessionData['project']['suites']) => {
      const suiteIndex = suites.findIndex(hasID(suiteID))
      return update(
        `${suiteIndex}.tests`,
        (tests) => {
          tests.splice(index, 0, testID)
          return tests
        },
        suites
      )
    },
    session
  )

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
