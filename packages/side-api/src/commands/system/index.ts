import type { Shape as Crash } from './crash'
import type { Shape as GetLogPath } from './getLogPath'
import type { Shape as OnLog } from './onLog'
import type { Shape as Quit } from './quit'

import * as crash from './crash'
import * as getLogPath from './getLogPath'
import * as onLog from './onLog'
import * as quit from './quit'

export const commands = {
  crash,
  getLogPath,
  onLog,
  quit,
}

/**
 * Allows for the IDE process to be exited gracefully or non-gracefully.
 */
export type Shape = {
  crash: Crash
  getLogPath: GetLogPath
  onLog: OnLog
  quit: Quit
}
