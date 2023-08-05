import type { Shape as Close } from './close'
import type { Shape as OpenCustom } from './openCustom'
import type { Shape as Open } from './open'

import * as close from './close'
import * as open from './open'
import * as openCustom from './openCustom'

export const commands = {
  close,
  open,
  openCustom,
}

export type Shape = {
  close: Close
  open: Open
  openCustom: OpenCustom
}
