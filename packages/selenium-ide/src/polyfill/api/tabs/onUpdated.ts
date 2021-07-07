import browserEventListener from 'browser/polyfill/classes/EventListener'
import mainEventListener from 'main/polyfill/classes/EventListener'
import { TabData } from 'polyfill/types'

/**
 * Shim from our shape to this event:
 * https://developer.chrome.com/docs/extensions/reference/tabs/#event-onUpdated
 */
export type BrowserTabsUpdateArgs = [number, Partial<TabData>, TabData]

export const browser = browserEventListener<BrowserTabsUpdateArgs>()
export const main = mainEventListener<BrowserTabsUpdateArgs>()
