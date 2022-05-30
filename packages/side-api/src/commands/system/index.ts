import { Shape as crash } from './crash'
import { Shape as quit } from './quit'

export * as crash from './crash'
export * as quit from './quit'

/**
 * Allows for the IDE process to be exited gracefully or non-gracefully.
 */
export type Shape = {
  crash: crash
  quit: quit
}
