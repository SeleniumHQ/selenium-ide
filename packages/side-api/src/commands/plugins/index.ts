import type { Shape as AddPreloadScript } from './addPreloadScript'
import type { Shape as AddRecorderPreprocessor } from './addRecorderPreprocessor'
import type { Shape as GetPreloads } from './getPreloads'
import type { Shape as List } from './list'
import type { Shape as ProjectCreate } from './projectCreate'
import type { Shape as ProjectDelete } from './projectDelete'
import type { Shape as ProjectEdit } from './projectEdit'

import * as addPreloadScript from './addPreloadScript'
import * as addRecorderPreprocessor from './addRecorderPreprocessor'
import * as getPreloads from './getPreloads'
import * as list from './list'
import * as projectCreate from './projectCreate'
import * as projectDelete from './projectDelete'
import * as projectEdit from './projectEdit'

export const commands = {
  addPreloadScript,
  addRecorderPreprocessor,
  getPreloads,
  list,
  projectCreate,
  projectDelete,
  projectEdit,
}
/**
 * Governs binding plugins to projects, and changing plugin paths
 */
export type Shape = {
  addPreloadScript: AddPreloadScript
  addRecorderPreprocessor: AddRecorderPreprocessor
  getPreloads: GetPreloads
  list: List
  projectCreate: ProjectCreate
  projectDelete: ProjectDelete
  projectEdit: ProjectEdit
}
