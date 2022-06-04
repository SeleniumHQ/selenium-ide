import type { Shape as Open } from './open'

import * as open from './open'

export const commands = {
  open,
}

/**
 * API for dealing with menus. Of course, only real interaction is popping them
 * up right now
 */
export type Shape = {
  open: Open
}
