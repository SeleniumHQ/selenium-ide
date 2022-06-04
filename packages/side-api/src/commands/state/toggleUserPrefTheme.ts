import set from 'lodash/fp/set'
import { ThemePref } from '../../models/state'
import { Mutator } from '../../types'

/**
 * Customizes command insert behavior to either follow or lead the current
 * command
 */
export type Shape = (themePref: ThemePref) => Promise<void>

export const mutator: Mutator<Shape> = (session, { params: [themePref] }) =>
  set('state.userPrefs.themePref', themePref, session)
