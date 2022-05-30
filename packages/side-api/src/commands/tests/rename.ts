import { TestShape } from '@seleniumhq/side-model'
import set from 'lodash/fp/set'
import update from 'lodash/fp/update'
import { hasID } from '../../helpers/hasID'
import { CoreSessionData, Mutator } from '../../types'

/**
 * Rename a test
 */
export type Shape = (testID: string, name: string) => Promise<void>

export const mutator: Mutator<Shape> = (
  session: CoreSessionData,
  { params: [testID, name] }
) =>
  update(
    'project.tests',
    (tests: TestShape[]) => {
      const testIndex = tests.findIndex(hasID(testID))
      return set(`${testIndex}.name`, name, tests)
    },
    session
  )
