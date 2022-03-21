import update from 'lodash/fp/update'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'
import { Mutator } from 'api/types'

export type Shape = Session['suites']['create']

export const mutator: Mutator<Shape> = (session, { result }) =>
  update('project.suites', (suites) => suites.concat(result), session)

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
