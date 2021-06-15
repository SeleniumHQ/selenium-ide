import { TabData } from '../../../types'
import { Session } from '../../../types/server'

/**
 * Shim from our shape to this event:
 * https://developer.chrome.com/docs/extensions/reference/tabs/#event-onCreated
 */

export type ChromeTabsRemoveInfo = {
  isWindowClosing?: boolean
  windowId?: number
}
export type ChromeTabsOnRemoved = [number, ChromeTabsRemoveInfo]
export default (_session: Session) => (tab: TabData): ChromeTabsOnRemoved => [
  tab.id,
  { isWindowClosing: false, windowId: tab.windowId },
]
