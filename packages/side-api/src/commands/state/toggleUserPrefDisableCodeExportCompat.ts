import set from 'lodash/fp/set'
import { VerboseBoolean } from '../../models/state'
import { Mutator } from '../../types'

/**
 * Customizes command insert behavior to either follow or lead the current
 * command
 */
export type Shape = (pref: VerboseBoolean) => Promise<void>

export const mutator: Mutator<Shape> = (session, { params: [pref] }) =>
  set('state.userPrefs.disableCodeExportCompat', pref, session)
