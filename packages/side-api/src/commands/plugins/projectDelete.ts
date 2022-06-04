import update from 'lodash/fp/update'
import { Mutator } from '../../types'

/**
 * Remove a plugin from the current project
 */
export type Shape = (index: number) => Promise<void>

export const mutator: Mutator<Shape> = (session, { params: [index] }) =>
  update(
    'project.plugins',
    (plugins: string[]) => {
      const newPlugins = plugins.slice(0)
      newPlugins.splice(index, 1)
      return newPlugins
    },
    session
  )
