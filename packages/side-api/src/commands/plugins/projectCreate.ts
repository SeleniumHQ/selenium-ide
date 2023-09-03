import update from 'lodash/fp/update'
import { Mutator } from '../../types/base'

/**
 * Add a plugin to the current project
 */
export type Shape = () => Promise<void>

export const mutator: Mutator<Shape> = (session) =>
  update('project.plugins', (plugins: string[]) => plugins.concat(''), session)
