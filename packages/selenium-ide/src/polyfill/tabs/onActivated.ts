import EventListener from 'browser/helpers/EventListener'
import { TabData } from 'polyfill/types'
import { Session } from 'main/types'

export const browser = EventListener()

/**
 * Shim from our shape to this event:
 * https://developer.chrome.com/docs/extensions/reference/tabs/#event-onActivated
 */
type BrowserTabsOnActivatedShape = [{ tabId: number; windowId: number }]

export const main =
  (_path: string, _session: Session) =>
  (tab: TabData): BrowserTabsOnActivatedShape =>
    [{ tabId: tab.id, windowId: tab.windowId }]
