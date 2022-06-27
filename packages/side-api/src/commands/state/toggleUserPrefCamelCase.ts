import set from 'lodash/fp/set'
import { CamelCaseNamesPref } from '../../models/state'
import { Mutator } from '../../types'

/**
 * Customizes command insert behavior to either follow or lead the current
 * command
 */
export type Shape = (camelCaseNamesPref: CamelCaseNamesPref) => Promise<void>

export const mutator: Mutator<Shape> = (
  session,
  { params: [camelCaseNamesPref] }
) => set('state.userPrefs.camelCaseNamesPref', camelCaseNamesPref, session)
