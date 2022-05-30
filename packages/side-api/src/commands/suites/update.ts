import { SuiteShape } from '@seleniumhq/side-model'
import { hasID } from '../../helpers/hasID'
import { CoreSessionData, Mutator } from '../../types'
import merge from 'lodash/fp/merge'
import update from 'lodash/fp/update'

/**
 * Changes the metadata of the selected suite
 */
export type Shape = (
  suiteID: string,
  updates: Partial<Omit<SuiteShape, 'tests'>>
) => Promise<void>

export const mutator: Mutator<Shape> = (
  session: CoreSessionData,
  { params: [suiteID, updates] }
) => {
  const suiteIndex = session.project.suites.findIndex(hasID(suiteID))
  const updatedSession = update(
    `project.suites[${suiteIndex}]`,
    (suite: SuiteShape) => merge(suite, updates),
    session
  )
  return updatedSession
}
