import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { AsyncReturnType, Mutator } from 'api/types'

export type Shape = Session['projects']['load']
export type Response = AsyncReturnType<Shape>

export const mutator: Mutator<Shape> = (session, { result }) => {
  session.project = result
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
