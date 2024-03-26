import type { Shape as Close } from './close'
import type { Shape as ClosePlaybackWindow } from './closePlaybackWindow'
import type { Shape as FocusPlaybackWindow } from './focusPlaybackWindow'
import type { Shape as NavigatePlaybackWindow } from './navigatePlaybackWindow'
import type { Shape as OnPlaybackWindowChanged } from './onPlaybackWindowChanged'
import type { Shape as OnPlaybackWindowClosed } from './onPlaybackWindowClosed'
import type { Shape as OnPlaybackWindowOpened } from './onPlaybackWindowOpened'
import type { Shape as Open } from './open'
import type { Shape as OpenCustom } from './openCustom'
import type { Shape as RequestCustomEditorPanel } from './requestCustomEditorPanel'
import type { Shape as RequestPlaybackWindow } from './requestPlaybackWindow'
import type { Shape as ShiftFocus } from './shiftFocus'

import * as close from './close'
import * as closePlaybackWindow from './closePlaybackWindow'
import * as focusPlaybackWindow from './focusPlaybackWindow'
import * as navigatePlaybackWindow from './navigatePlaybackWindow'
import * as onPlaybackWindowChanged from './onPlaybackWindowChanged'
import * as onPlaybackWindowClosed from './onPlaybackWindowClosed'
import * as onPlaybackWindowOpened from './onPlaybackWindowOpened'
import * as open from './open'
import * as openCustom from './openCustom'
import * as requestCustomEditorPanel from './requestCustomEditorPanel'
import * as requestPlaybackWindow from './requestPlaybackWindow'
import * as shiftFocus from './shiftFocus'

export const commands = {
  close,
  closePlaybackWindow,
  focusPlaybackWindow,
  navigatePlaybackWindow,
  onPlaybackWindowChanged,
  onPlaybackWindowClosed,
  onPlaybackWindowOpened,
  open,
  openCustom,
  requestCustomEditorPanel,
  requestPlaybackWindow,
  shiftFocus,
}

export type Shape = {
  close: Close
  closePlaybackWindow: ClosePlaybackWindow
  focusPlaybackWindow: FocusPlaybackWindow
  navigatePlaybackWindow: NavigatePlaybackWindow
  onPlaybackWindowChanged: OnPlaybackWindowChanged
  onPlaybackWindowClosed: OnPlaybackWindowClosed
  onPlaybackWindowOpened: OnPlaybackWindowOpened
  open: Open
  openCustom: OpenCustom
  requestCustomEditorPanel: RequestCustomEditorPanel
  requestPlaybackWindow: RequestPlaybackWindow
  shiftFocus: ShiftFocus
}
