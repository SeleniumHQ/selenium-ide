import update from 'lodash/fp/update'
import { Mutator } from 'api/types'
import browserHandler from 'browser/api/classes/Handler'
import mainHandler, { passthrough } from 'main/api/classes/Handler'

export type Shape = (index: number, path: string) => Promise<void>

export const mutator: Mutator<Shape> = (session, { params: [index, path] }) =>
  update(
    'project.plugins',
    (plugins: string[]) => {
      const newPlugins = plugins.slice(0)
      newPlugins[index] = path
      return newPlugins
    },
    session
  )

export const browser = browserHandler<Shape>()

export const main = mainHandler<Shape>(passthrough)
