import update from 'lodash/fp/update'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler, { passthrough } from 'main/api/classes/Handler'
import { CoreSessionData, Mutator } from 'api/types'

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

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>(passthrough)
