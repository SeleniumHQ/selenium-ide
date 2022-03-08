import { Mutator } from 'api/types'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'

export type Shape = Session['tests']['create']

export const mutator: Mutator<Shape> = (
  session,
  { result }
) => ({
  ...session,
  project: {
    ...session.project,
    tests: session.project.tests.concat(result),
  },
})

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
