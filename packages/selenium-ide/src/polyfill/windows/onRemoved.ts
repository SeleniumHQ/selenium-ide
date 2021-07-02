import EventListener from 'browser/helpers/EventListener'
import { Session } from 'main/types'
import { WindowData } from 'polyfill/types'

export const browser = EventListener()

/**
 * Shim from our shape to this event:
 * https://developer.chrome.com/docs/extensions/reference/windows/#event-onRemoved
 */

export type ChromeWindowsOnRemoved = [number]
export const main =
  (_path: string, _session: Session) =>
  (window: WindowData): ChromeWindowsOnRemoved =>
    [window.id]
