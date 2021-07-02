import EventListener from 'browser/helpers/EventListener'
import { WindowData } from 'polyfill/types'
import { Session } from 'main/types'

export const browser = EventListener()

/**
 * Shim from our shape to this event:
 * https://developer.chrome.com/docs/extensions/reference/windows/#event-onRemoved
 */

export type ChromeWindowsOnCreated = [WindowData]
export const main =
  (_path: string, _session: Session) =>
  (window: WindowData): ChromeWindowsOnCreated =>
    [window]
