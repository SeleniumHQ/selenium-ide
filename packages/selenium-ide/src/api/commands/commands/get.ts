import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Mutator } from 'api/types'
import { Session } from 'main/types'

export type Shape = Session['commands']['get']

export const mutator: Mutator<Shape> = (session, { result }) => {
  session.state.commands = result
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
