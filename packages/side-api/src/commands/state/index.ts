import type { Shape as CloseTestEditor } from './closeTestEditor'
import type { Shape as Get } from './get'
import type { Shape as OnMutate } from './onMutate'
import type { Shape as OpenTestEditor } from './openTestEditor'
import type { Shape as SetActiveCommand } from './setActiveCommand'
import type { Shape as SetActiveSuite } from './setActiveSuite'
import type { Shape as SetActiveTest } from './setActiveTest'
import type { Shape as SetCopiedCommands } from './setCopiedCommands'
import type { Shape as ToggleBreakpoint } from './toggleBreakpoint'
import type { Shape as ToggleUserPrefInsert } from './toggleUserPrefInsert'
import type { Shape as UpdateStepSelection } from './updateStepSelection'
import type { Shape as UpdateTestSelection } from './updateTestSelection'

import * as closeTestEditor from './closeTestEditor'
import * as get from './get'
import * as onMutate from './onMutate'
import * as openTestEditor from './openTestEditor'
import * as setActiveCommand from './setActiveCommand'
import * as setActiveSuite from './setActiveSuite'
import * as setActiveTest from './setActiveTest'
import * as setCopiedCommands from './setCopiedCommands'
import * as toggleBreakpoint from './toggleBreakpoint'
import * as toggleUserPrefInsert from './toggleUserPrefInsert'
import * as updateStepSelection from './updateStepSelection'
import * as updateTestSelection from './updateTestSelection'

export const commands = {
  closeTestEditor,
  get,
  onMutate,
  openTestEditor,
  setActiveCommand,
  setActiveSuite,
  setActiveTest,
  setCopiedCommands,
  toggleBreakpoint,
  toggleUserPrefInsert,
  updateStepSelection,
  updateTestSelection,
}

/**
 * Provides a wide range of functions for adjusting the current project state.
 */
export type Shape = {
  closeTestEditor: CloseTestEditor
  get: Get
  onMutate: OnMutate
  openTestEditor: OpenTestEditor
  setActiveCommand: SetActiveCommand
  setActiveSuite: SetActiveSuite
  setActiveTest: SetActiveTest
  setCopiedCommands: SetCopiedCommands
  toggleBreakpoint: ToggleBreakpoint
  toggleUserPrefInsert: ToggleUserPrefInsert
  updateStepSelection: UpdateStepSelection
  updateTestSelection: UpdateTestSelection
}
