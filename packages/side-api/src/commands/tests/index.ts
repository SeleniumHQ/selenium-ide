import type { Shape as AddSteps } from './addSteps'
import type { Shape as Create } from './create'
import type { Shape as DeleteTest } from './delete'
import type { Shape as RemoveSteps } from './removeSteps'
import type { Shape as Rename } from './rename'
import type { Shape as ReorderSteps } from './reorderSteps'
import type { Shape as ToggleStepDisability } from './toggleStepDisability'
import type { Shape as UpdateStep } from './updateStep'

import * as addSteps from './addSteps'
import * as create from './create'
import * as deleteTest from './delete'
import * as removeSteps from './removeSteps'
import * as rename from './rename'
import * as reorderSteps from './reorderSteps'
import * as toggleStepDisability from './toggleStepDisability'
import * as updateStep from './updateStep'

export const commands = {
  addSteps,
  create,
  delete: deleteTest,
  removeSteps,
  rename,
  reorderSteps,
  toggleStepDisability,
  updateStep,
}

/**
 * Body of functions around editing test steps and creating / deleting tests
 */
export type Shape = {
  addSteps: AddSteps
  create: Create
  delete: DeleteTest
  removeSteps: RemoveSteps
  rename: Rename
  reorderSteps: ReorderSteps
  toggleStepDisability: ToggleStepDisability
  updateStep: UpdateStep
}
