import browserEventListener from 'browser/helpers/EventListener'
import mainEventListener from 'main/helpers/EventListener'

/**
 * Shim from our shape to this event:
 * https://developer.chrome.com/docs/extensions/reference/tabs/#event-onActivated
 */
type TabsOnActivatedShape = [{ tabId: number; windowId: number }]

export const browser = browserEventListener<TabsOnActivatedShape>()
export const main = mainEventListener<TabsOnActivatedShape>()
