import type { Shape as Close } from './close'
import type { Shape as Open } from './open'

import * as close from './close'
import * as open from './open'

export const commands = {
  close,
  open,
}

export type Shape = {
  close: Close
  open: Open
}
