import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { Mutator } from 'api/types'

export type Shape = Session['state']['toggleBreakpoint']

export const mutator: Mutator<Shape> = (
  { state: { breakpoints } },
  commandID
) => {
  breakpoints.includes(commandID)
    ? breakpoints.splice(breakpoints.indexOf(commandID))
    : breakpoints.push(commandID)
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
