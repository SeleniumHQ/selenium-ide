import update from 'lodash/fp/update'
import { Mutator } from 'api/types'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler, { passthrough } from 'main/api/classes/Handler'

export type Shape = () => Promise<void>

export const mutator: Mutator<Shape> = (session) =>
  update('project.plugins', (plugins: string[]) => plugins.concat(''), session)

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>(passthrough)
