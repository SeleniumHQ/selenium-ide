import type { Shape as List } from './list'
import type { Shape as ProjectCreate } from './projectCreate'
import type { Shape as ProjectDelete } from './projectDelete'
import type { Shape as ProjectEdit } from './projectEdit'

import * as list from './list'
import * as projectCreate from './projectCreate'
import * as projectDelete from './projectDelete'
import * as projectEdit from './projectEdit'

export const commands = {
  list,
  projectCreate,
  projectDelete,
  projectEdit,
}
/**
 * Governs binding plugins to projects, and changing plugin paths
 */
export type Shape = {
  list: List
  projectCreate: ProjectCreate
  projectDelete: ProjectDelete
  projectEdit: ProjectEdit
}
