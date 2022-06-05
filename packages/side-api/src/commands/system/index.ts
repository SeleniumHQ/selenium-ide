import type { Shape as Crash } from './crash'
import type { Shape as Quit } from './quit'

import * as crash from './crash'
import * as quit from './quit'

export const commands = {
  crash,
  quit,
}

/**
 * Allows for the IDE process to be exited gracefully or non-gracefully.
 */
export type Shape = {
  crash: Crash
  quit: Quit
}
