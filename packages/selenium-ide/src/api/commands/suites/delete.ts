import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { Mutator } from 'api/types'

export type Shape = Session['suites']['delete']

export const mutator: Mutator<Shape> = (session, { params: [suiteID] }) => {
  const { suites } = session.project
  const index = suites.findIndex((suite) => suite.id === suiteID)
  suites.splice(index, 1)
}

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
