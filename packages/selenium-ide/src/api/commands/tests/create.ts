import update from 'lodash/fp/update'
import { Mutator } from 'api/types'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler from 'main/api/classes/Handler'
import { Session } from 'main/types'

export type Shape = Session['tests']['create']

export const mutator: Mutator<Shape> = (session, { result }) =>
  update('project.tests', (tests) => tests.concat(result), session)

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>()
