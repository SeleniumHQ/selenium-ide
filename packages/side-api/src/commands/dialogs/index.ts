import type { Shape as Confirm } from './confirm'
import type { Shape as Open } from './open'

import * as confirm from './confirm'
import * as open from './open'

export const commands = {
  confirm,
  open,
}

/**
 * Manages the presenting of dialogs to the user
 */
export type Shape = {
  confirm: Confirm
  open: Open
}
