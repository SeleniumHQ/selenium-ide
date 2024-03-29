import set from 'lodash/fp/set'
import { InsertCommandPref } from '../../models/state'
import { Mutator } from '../../types/base'

/**
 * Customizes command insert behavior to either follow or lead the current
 * command
 */
export type Shape = (insertCommandPref: InsertCommandPref) => Promise<void>

export const mutator: Mutator<Shape> = (
  session,
  { params: [insertCommandPref] }
) => set('state.userPrefs.insertCommandPref', insertCommandPref, session)
