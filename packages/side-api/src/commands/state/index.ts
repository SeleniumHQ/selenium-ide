import type { Shape as CloseTestEditor } from './closeTestEditor'
import type { Shape as Get } from './get'
import type { Shape as GetUserPrefs } from './getUserPrefs'
import type { Shape as OnMutate } from './onMutate'
import type { Shape as OpenTestEditor } from './openTestEditor'
import type { Shape as SetActiveCommand } from './setActiveCommand'
import type { Shape as SetActiveSuite } from './setActiveSuite'
import type { Shape as SetActiveTest } from './setActiveTest'
import type { Shape as SetCopiedCommands } from './setCopiedCommands'
import type { Shape as ToggleBreakpoint } from './toggleBreakpoint'
import type { Shape as ToggleSuiteMode } from './toggleSuiteMode'
import type { Shape as ToggleUserPrefCamelCase } from './toggleUserPrefCamelCase'
import type { Shape as ToggleUserPrefIgnoreCertificateErrors } from './toggleUserPrefIgnoreCertificateErrors'
import type { Shape as ToggleUserPrefInsert } from './toggleUserPrefInsert'
import type { Shape as ToggleUserPrefTheme } from './toggleUserPrefTheme'
import type { Shape as UpdateStepSelection } from './updateStepSelection'
import type { Shape as UpdateTestSelection } from './updateTestSelection'

import * as closeTestEditor from './closeTestEditor'
import * as get from './get'
import * as getUserPrefs from './getUserPrefs'
import * as onMutate from './onMutate'
import * as openTestEditor from './openTestEditor'
import * as setActiveCommand from './setActiveCommand'
import * as setActiveSuite from './setActiveSuite'
import * as setActiveTest from './setActiveTest'
import * as setCopiedCommands from './setCopiedCommands'
import * as toggleBreakpoint from './toggleBreakpoint'
import * as toggleSuiteMode from './toggleSuiteMode'
import * as toggleUserPrefCamelCase from './toggleUserPrefCamelCase'
import * as toggleUserPrefIgnoreCertificateErrors from './toggleUserPrefIgnoreCertificateErrors'
import * as toggleUserPrefInsert from './toggleUserPrefInsert'
import * as toggleUserPrefTheme from './toggleUserPrefTheme'
import * as updateStepSelection from './updateStepSelection'
import * as updateTestSelection from './updateTestSelection'

export const commands = {
  closeTestEditor,
  get,
  getUserPrefs,
  onMutate,
  openTestEditor,
  setActiveCommand,
  setActiveSuite,
  setActiveTest,
  setCopiedCommands,
  toggleBreakpoint,
  toggleSuiteMode,
  toggleUserPrefCamelCase,
  toggleUserPrefIgnoreCertificateErrors,
  toggleUserPrefInsert,
  toggleUserPrefTheme,
  updateStepSelection,
  updateTestSelection,
}

/**
 * Provides a wide range of functions for adjusting the current project state.
 */
export type Shape = {
  closeTestEditor: CloseTestEditor
  get: Get
  getUserPrefs: GetUserPrefs
  onMutate: OnMutate
  openTestEditor: OpenTestEditor
  setActiveCommand: SetActiveCommand
  setActiveSuite: SetActiveSuite
  setActiveTest: SetActiveTest
  setCopiedCommands: SetCopiedCommands
  toggleBreakpoint: ToggleBreakpoint
  toggleSuiteMode: ToggleSuiteMode
  toggleUserPrefCamelCase: ToggleUserPrefCamelCase
  toggleUserPrefIgnoreCertificateErrors: ToggleUserPrefIgnoreCertificateErrors
  toggleUserPrefInsert: ToggleUserPrefInsert
  toggleUserPrefTheme: ToggleUserPrefTheme
  updateStepSelection: UpdateStepSelection
  updateTestSelection: UpdateTestSelection
}
