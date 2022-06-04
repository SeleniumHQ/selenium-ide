import update from 'lodash/fp/update'
import { CoreSessionData, Mutator } from '../../types'
import { hasID } from '../../helpers/hasID'

/**
 * Adds tests to the chosen suite
 */
export type Shape = (
  suiteID: string,
  testIDs: string[],
  index: number
) => Promise<void>

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
