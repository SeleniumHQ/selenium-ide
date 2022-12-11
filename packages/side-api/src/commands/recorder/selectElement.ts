import capitalize from 'lodash/fp/capitalize'
import { mutator as updateStepMutator } from '../tests/updateStep'
import { getActiveCommand } from '../../helpers/getActiveData'
import { LocatorFields, Mutator } from '../../types'

/**
 * Tells the project editor what the requested select element was so the IDE
 * can assign it to the expected field.
 */
export type Shape = (
  field: LocatorFields,
  element: [string, string][]
) => Promise<void>

export const mutator: Mutator<Shape> = (session, { params }) =>
  updateStepMutator(session, {
    params: [
      session.state.activeTestID,
      getActiveCommand(session).id,
      {
        [params[0]]: params[1][0][0],
        [`fallback${capitalize(params[0])}s`]: params[1],
      },
    ],
    result: undefined,
  })
