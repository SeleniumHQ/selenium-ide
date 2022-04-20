import update from 'lodash/fp/update'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler, { passthrough } from 'main/api/classes/Handler'
import { CoreSessionData, Mutator } from 'api/types'
import { hasID } from 'api/helpers/hasID'

export type Shape = (suiteID: string, testIDs: string[], index: number) => Promise<void>

export const mutator: Mutator<Shape> = (
  session,
  { params: [suiteID, testIDs, index] }
) =>
  update(
    'project.suites',
    (suites: CoreSessionData['project']['suites']) => {
      const suiteIndex = suites.findIndex(hasID(suiteID))
      return update(
        `${suiteIndex}.tests`,
        (tests) => {
          tests.splice(index, 0, ...testIDs)
          return tests
        },
        suites
      )
    },
    session
  )

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>(passthrough)
