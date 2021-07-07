import browserEventListener from 'browser/polyfill/classes/EventListener'
import mainEventListener from 'main/polyfill/classes/EventListener'

/**
 * Shim from our shape to this event:
 * https://developer.chrome.com/docs/extensions/reference/windows/#event-onFocusChanged
 */

export type WindowsOnFocusChanged = [number]

export const browser = browserEventListener<WindowsOnFocusChanged>()
export const main = mainEventListener<WindowsOnFocusChanged>()
