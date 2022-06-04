import { Shape as addSteps } from './addSteps'
import { Shape as create } from './create'
import { Shape as deleteTest } from './delete'
import { Shape as removeSteps } from './removeSteps'
import { Shape as rename } from './rename'
import { Shape as reorderSteps } from './reorderSteps'
import { Shape as toggleStepDisability } from './toggleStepDisability'
import { Shape as updateStep } from './updateStep'

export * as addSteps from './addSteps'
export * as create from './create'
export * as delete from './delete'
export * as removeSteps from './removeSteps'
export * as rename from './rename'
export * as reorderSteps from './reorderSteps'
export * as toggleStepDisability from './toggleStepDisability'
export * as updateStep from './updateStep'

/**
 * Body of functions around editing test steps and creating / deleting tests
 */
export type Shape = {
  addSteps: addSteps
  create: create
  delete: deleteTest
  removeSteps: removeSteps
  rename: rename
  reorderSteps: reorderSteps
  toggleStepDisability: toggleStepDisability
  updateStep: updateStep
}
