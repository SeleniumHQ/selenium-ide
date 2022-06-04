import { Shape as close } from './close'
import { Shape as open } from './open'

export * as close from './close'
export * as open from './open'

export type Shape = {
  close: close
  open: open
}
