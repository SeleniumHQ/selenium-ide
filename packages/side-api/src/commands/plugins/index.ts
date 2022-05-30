import { Shape as list } from './list'
import { Shape as projectCreate } from './projectCreate'
import { Shape as projectDelete } from './projectDelete'
import { Shape as projectEdit } from './projectEdit'

export * as list from './list'
export * as projectCreate from './projectCreate'
export * as projectDelete from './projectDelete'
export * as projectEdit from './projectEdit'

/**
 * Governs binding plugins to projects, and changing plugin paths
 */
export type Shape = {
  list: list
  projectCreate: projectCreate
  projectDelete: projectDelete
  projectEdit: projectEdit
}
