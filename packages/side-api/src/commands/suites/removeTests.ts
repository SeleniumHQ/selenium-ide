import { SuiteShape } from '@seleniumhq/side-model'
import update from 'lodash/fp/update'
import { Mutator } from '../../types'
import { hasID } from '../../helpers/hasID'

/**
 * Removes tests from the chosen suite
 */
export type Shape = (suiteID: string, testIDs: string[]) => Promise<void>
export const mutator: Mutator<Shape> = (
  session,
  { params: [suiteID, testIDs] }
) =>
  update(
    'project.suites',
    (suites: SuiteShape[]) => {
      const suiteIndex = suites.findIndex(hasID(suiteID))
      return update(
        `${suiteIndex}.tests`,
        (tests: SuiteShape['tests']) =>
          tests.filter((id) => !testIDs.includes(id)),
        suites
      )
    },
    session
  )
