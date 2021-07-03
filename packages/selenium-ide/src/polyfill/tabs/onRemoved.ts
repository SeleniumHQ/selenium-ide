import browserEventListener from 'browser/helpers/EventListener'
import mainEventListener from 'main/helpers/EventListener'

/**
 * Shim from our shape to this event:
 * https://developer.chrome.com/docs/extensions/reference/tabs/#event-onCreated
 */

export type ChromeTabsRemoveInfo = {
  isWindowClosing?: boolean
  windowId?: number
}
export type ChromeTabsOnRemoved = [number, ChromeTabsRemoveInfo]

export const browser = browserEventListener<ChromeTabsOnRemoved>()
export const main = mainEventListener<ChromeTabsOnRemoved>()
