import set from 'lodash/fp/set'
import update from 'lodash/fp/update'
import { getActiveSuite } from '../../helpers'
import { TestResultShape } from '../../models'
import { Mutator } from '../../types/base'

/**
 * Start running a test suite. Results should be processed using
 * onStepUpdate and onPlayUpdate.
 */
export type Shape = () => Promise<void>

export const mutator: Mutator = (session) =>
  update(
    'state.playback.testResults',
    (testResults: Record<string, TestResultShape>) => {
      const { tests } = getActiveSuite(session)
      return Object.fromEntries(
        Object.entries(testResults).filter(([key]) => tests.indexOf(key) === -1)
      )
    },
    set('state.status', 'playing', session)
  )
