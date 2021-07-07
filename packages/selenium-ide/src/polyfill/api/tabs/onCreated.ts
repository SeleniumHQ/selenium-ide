import browserEventListener from 'browser/polyfill/classes/EventListener'
import mainEventListener from 'main/polyfill/classes/EventListener'
import { TabData } from 'polyfill/types'

/**
 * Shim from our shape to this event:
 * https://developer.chrome.com/docs/extensions/reference/tabs/#event-onCreated
 */
export type TabsOnCreated = [TabData]
export const browser = browserEventListener<TabsOnCreated>()
export const main = mainEventListener<TabsOnCreated>()
