import { ProjectShape } from '@seleniumhq/side-model'
import merge from 'lodash/fp/merge'
import update from 'lodash/fp/update'
import { CoreSessionData, Mutator } from '../../types'

/**
 * Edits project level config flags, like name or url.
 */
export type Shape = (
  updates: Partial<Pick<ProjectShape, 'name' | 'url' | 'delay'>>
) => Promise<boolean>

export const mutator: Mutator<Shape> = (
  session: CoreSessionData,
  { params: [updates] }
) =>
  update(`project`, (project: ProjectShape) => merge(project, updates), session)
