import { TabData } from '../../../types'
import { Session } from '../../../types/server'

/**
 * Shim from our shape to this event:
 * https://developer.chrome.com/docs/extensions/reference/tabs/#event-onCreated
 */
export default (_session: Session) => (tab: TabData): TabData[] => [tab]
