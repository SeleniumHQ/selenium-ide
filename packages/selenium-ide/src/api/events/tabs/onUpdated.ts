import { TabDelta, TabData } from '../../../types'
import { Session } from '../../../types/server'

/**
 * Shim from our shape to this event:
 * https://developer.chrome.com/docs/extensions/reference/tabs/#event-onUpdated
 */
export type BrowserTabsUpdateArgs = [number, TabDelta, TabData]
export default (_session: Session) => (tab: TabData): BrowserTabsUpdateArgs => [
  tab.id,
  tab,
  tab,
]
