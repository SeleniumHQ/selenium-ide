import EventListener from 'browser/helpers/EventListener'
import { TabData } from 'polyfill/types'
import { Session } from 'main/types'

export const browser = EventListener()

/**
 * Shim from our shape to this event:
 * https://developer.chrome.com/docs/extensions/reference/tabs/#event-onCreated
 */

export type ChromeTabsRemoveInfo = {
  isWindowClosing?: boolean
  windowId?: number
}
export type ChromeTabsOnRemoved = [number, ChromeTabsRemoveInfo]
export const main =
  (_path: string, _session: Session) =>
  (tab: TabData): ChromeTabsOnRemoved =>
    [tab.id, { isWindowClosing: false, windowId: tab.windowId }]
