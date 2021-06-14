import { Session, TabDelta, TabShim } from '../../../types'

/**
 * Shim from our shape to this event:
 * https://developer.chrome.com/docs/extensions/reference/tabs/#event-onUpdated
 */
type BrowserTabsOnUpdatedShape = [number, TabDelta, TabShim]
export default (_session: Session) => (
  tab: TabShim
): BrowserTabsOnUpdatedShape => [tab.id, tab, tab]
