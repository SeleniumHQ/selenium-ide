import type { Shape as Open } from './open'
import type { Shape as OpenSync } from './openSync'

import * as open from './open'
import * as openSync from './openSync'

export const commands = {
  open,
  openSync,
}

/**
 * API for dealing with menus. Of course, only real interaction is popping them
 * up right now
 */
export type Shape = {
  open: Open
  openSync: OpenSync
}
