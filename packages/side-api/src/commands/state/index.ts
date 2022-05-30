import { Shape as closeTestEditor } from './closeTestEditor'
import { Shape as get } from './get'
import { Shape as onMutate } from './onMutate'
import { Shape as openTestEditor } from './openTestEditor'
import { Shape as setActiveCommand } from './setActiveCommand'
import { Shape as setActiveSuite } from './setActiveSuite'
import { Shape as setActiveTest } from './setActiveTest'
import { Shape as setCopiedCommands } from './setCopiedCommands'
import { Shape as toggleBreakpoint } from './toggleBreakpoint'
import { Shape as toggleUserPrefInsert } from './toggleUserPrefInsert'
import { Shape as updateStepSelection } from './updateStepSelection'
import { Shape as updateTestSelection } from './updateTestSelection'

export * as closeTestEditor from './closeTestEditor'
export * as get from './get'
export * as onMutate from './onMutate'
export * as openTestEditor from './openTestEditor'
export * as setActiveCommand from './setActiveCommand'
export * as setActiveSuite from './setActiveSuite'
export * as setActiveTest from './setActiveTest'
export * as setCopiedCommands from './setCopiedCommands'
export * as toggleBreakpoint from './toggleBreakpoint'
export * as toggleUserPrefInsert from './toggleUserPrefInsert'
export * as updateStepSelection from './updateStepSelection'
export * as updateTestSelection from './updateTestSelection'

/**
 * Provides a wide range of functions for adjusting the current project state.
 */
export type Shape = {
  closeTestEditor: closeTestEditor
  get: get
  onMutate: onMutate
  openTestEditor: openTestEditor
  setActiveCommand: setActiveCommand
  setActiveSuite: setActiveSuite
  setActiveTest: setActiveTest
  setCopiedCommands: setCopiedCommands
  toggleBreakpoint: toggleBreakpoint
  toggleUserPrefInsert: toggleUserPrefInsert
  updateStepSelection: updateStepSelection
  updateTestSelection: updateTestSelection
}
