import EventListener from 'browser/helpers/EventListener'
import { TabData } from 'polyfill/types'
import { Session } from 'main/types'

export const browser = EventListener()

/**
 * Shim from our shape to this event:
 * https://developer.chrome.com/docs/extensions/reference/tabs/#event-onUpdated
 */
export type BrowserTabsUpdateArgs = [number, Partial<TabData>, TabData]
export const main =
  (_path: string, _session: Session) =>
  (changeInfo: Partial<TabData>, tab: TabData): BrowserTabsUpdateArgs =>
    [tab.id, changeInfo, tab]
