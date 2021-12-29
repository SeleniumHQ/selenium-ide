import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { Mutator } from 'api/types'

export type Shape = Session['projects']['new']

export const mutator: Mutator<Shape> = (session, { result }) => ({
  ...session,
  project: result,
})

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
