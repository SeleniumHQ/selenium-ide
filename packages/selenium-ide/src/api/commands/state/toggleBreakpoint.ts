import update from 'lodash/fp/update'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { CoreSessionData, Mutator } from 'api/types'

export type Shape = Session['state']['toggleBreakpoint']

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

export const main = mainHandler<Shape>()
