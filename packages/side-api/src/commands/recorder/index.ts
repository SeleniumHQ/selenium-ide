import { Shape as getFrameLocation } from './getFrameLocation'
import { Shape as onFrameDeleted } from './onFrameDeleted'
import { Shape as onFrameRecalculate } from './onFrameRecalculate'
import { Shape as onNewWindow } from './onNewWindow'
import { Shape as onRequestSelectElement } from './onRequestSelectElement'
import { Shape as recordNewCommand } from './recordNewCommand'
import { Shape as requestSelectElement } from './requestSelectElement'
import { Shape as selectElement } from './selectElement'
import { Shape as setWindowHandle } from './setWindowHandle'
import { Shape as start } from './start'
import { Shape as stop } from './stop'

export * as getFrameLocation from './getFrameLocation'
export * as onFrameDeleted from './onFrameDeleted'
export * as onFrameRecalculate from './onFrameRecalculate'
export * as onNewWindow from './onNewWindow'
export * as onRequestSelectElement from './onRequestSelectElement'
export * as recordNewCommand from './recordNewCommand'
export * as requestSelectElement from './requestSelectElement'
export * as selectElement from './selectElement'
export * as setWindowHandle from './setWindowHandle'
export * as start from './start'
export * as stop from './stop'

/**
 * Provides all hooks for recording the frontend interactions across frames
 * and windows.
 */
export type Shape = {
  getFrameLocation: getFrameLocation
  onFrameDeleted: onFrameDeleted
  onFrameRecalculate: onFrameRecalculate
  onNewWindow: onNewWindow
  onRequestSelectElement: onRequestSelectElement
  recordNewCommand: recordNewCommand
  requestSelectElement: requestSelectElement
  selectElement: selectElement
  setWindowHandle: setWindowHandle
  start: start
  stop: stop
}
