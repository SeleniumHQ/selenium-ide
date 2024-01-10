import type { Shape as GetPanelGroup } from './get-panel-group'
import type { Shape as SetPanelGroup } from './set-panel-group'

import * as getPanelGroup from './get-panel-group'
import * as setPanelGroup from './set-panel-group'

export const commands = {
  getPanelGroup,
  setPanelGroup,
}

/**
 * API for resizing panels and persisting that state
 */
export type Shape = {
  getPanelGroup: GetPanelGroup
  setPanelGroup: SetPanelGroup
}
