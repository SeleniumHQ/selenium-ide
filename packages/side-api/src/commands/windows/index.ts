import type { Shape as Close } from './close'
import type { Shape as ClosePlaybackWindow } from './closePlaybackWindow'
import type { Shape as FocusPlaybackWindow } from './focusPlaybackWindow'
import type { Shape as OnPlaybackWindowChanged } from './onPlaybackWindowChanged'
import type { Shape as OnPlaybackWindowClosed } from './onPlaybackWindowClosed'
import type { Shape as OnPlaybackWindowOpened } from './onPlaybackWindowOpened'
import type { Shape as OpenCustom } from './openCustom'
import type { Shape as Open } from './open'

import * as close from './close'
import * as closePlaybackWindow from './closePlaybackWindow'
import * as focusPlaybackWindow from './focusPlaybackWindow'
import * as onPlaybackWindowChanged from './onPlaybackWindowChanged'
import * as onPlaybackWindowClosed from './onPlaybackWindowClosed'
import * as onPlaybackWindowOpened from './onPlaybackWindowOpened'
import * as open from './open'
import * as openCustom from './openCustom'

export const commands = {
  close,
  closePlaybackWindow,
  focusPlaybackWindow,
  onPlaybackWindowChanged,
  onPlaybackWindowClosed,
  onPlaybackWindowOpened,
  open,
  openCustom,
}

export type Shape = {
  close: Close
  closePlaybackWindow: ClosePlaybackWindow
  focusPlaybackWindow: FocusPlaybackWindow
  onPlaybackWindowChanged: OnPlaybackWindowChanged
  onPlaybackWindowClosed: OnPlaybackWindowClosed
  onPlaybackWindowOpened: OnPlaybackWindowOpened
  open: Open
  openCustom: OpenCustom
}
