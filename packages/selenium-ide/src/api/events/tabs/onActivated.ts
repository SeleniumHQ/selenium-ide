import { TabData } from '../../../types'
import { Session } from '../../../types/server'

/**
 * Shim from our shape to this event:
 * https://developer.chrome.com/docs/extensions/reference/tabs/#event-onActivated
 */
type BrowserTabsOnActivatedShape = [{ tabId: number; windowId: number }]

export default (_session: Session) => (
  tab: TabData
): BrowserTabsOnActivatedShape => [{ tabId: tab.id, windowId: tab.windowId }]
