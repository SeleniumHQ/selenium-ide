import type { Shape as Open } from './open'

import * as open from './open'

export const commands = {
  open,
}

/**
 * Manages the presenting of dialogs to the user
 */
export type Shape = {
  open: Open
}
