import type { Shape as List } from './list'
import type { Shape as ListPreloadPaths } from './listPreloadPaths'
import type { Shape as ProjectCreate } from './projectCreate'
import type { Shape as ProjectDelete } from './projectDelete'
import type { Shape as ProjectEdit } from './projectEdit'

import * as list from './list'
import * as listPreloadPaths from './listPreloadPaths'
import * as projectCreate from './projectCreate'
import * as projectDelete from './projectDelete'
import * as projectEdit from './projectEdit'

export const commands = {
  list,
  listPreloadPaths,
  projectCreate,
  projectDelete,
  projectEdit,
}
/**
 * Governs binding plugins to projects, and changing plugin paths
 */
export type Shape = {
  list: List
  listPreloadPaths: ListPreloadPaths
  projectCreate: ProjectCreate
  projectDelete: ProjectDelete
  projectEdit: ProjectEdit
}
