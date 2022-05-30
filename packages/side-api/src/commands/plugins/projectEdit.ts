import update from 'lodash/fp/update'
import { Mutator } from '../../types'

/**
 * Update the path to a plugin on the current project
 */
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
