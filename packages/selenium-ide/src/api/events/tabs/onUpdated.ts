import { TabData } from '../../../types'
import { Session } from '../../../types/server'

/**
 * Shim from our shape to this event:
 * https://developer.chrome.com/docs/extensions/reference/tabs/#event-onUpdated
 */
export type BrowserTabsUpdateArgs = [number, Partial<TabData>, TabData]
export default (_session: Session) => (
  changeInfo: Partial<TabData>,
  tab: TabData
): BrowserTabsUpdateArgs => [tab.id, changeInfo, tab]
