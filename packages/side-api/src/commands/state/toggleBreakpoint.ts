import update from 'lodash/fp/update'
import { CoreSessionData, Mutator } from '../../types'

/**
 * Toggles breakpoints in the active test
 */
export type Shape = (stepID: string) => Promise<void>

export const mutator: Mutator<Shape> = (session, { params: [commandID] }) =>
  update(
    'state.breakpoints',
    (breakpoints: CoreSessionData['state']['breakpoints']) =>
      breakpoints.includes(commandID)
        ? breakpoints.filter((id) => id !== commandID)
        : breakpoints.concat(commandID),
    session
  )
