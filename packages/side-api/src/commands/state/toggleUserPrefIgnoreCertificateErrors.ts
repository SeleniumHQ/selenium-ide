import set from 'lodash/fp/set'
import { IgnoreCertificateErrorsPref } from '../../models/state'
import { Mutator } from '../../types'

/**
 * Customizes command insert behavior to either follow or lead the current
 * command
 */
export type Shape = (
  ignoreCertificateErrorsPref: IgnoreCertificateErrorsPref
) => Promise<void>

export const mutator: Mutator<Shape> = (
  session,
  { params: [ignoreCertificateErrorsPref] }
) =>
  set(
    'state.userPrefs.ignoreCertificateErrorsPref',
    ignoreCertificateErrorsPref,
    session
  )
