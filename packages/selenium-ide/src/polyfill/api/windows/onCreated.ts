import browserEventListener from 'browser/polyfill/classes/EventListener'
import mainEventListener from 'main/polyfill/classes/EventListener'
import { WindowData } from 'polyfill/types'

/**
 * Shim from our shape to this event:
 * https://developer.chrome.com/docs/extensions/reference/windows/#event-onCreated
 */

export type WindowsOnCreated = [WindowData]

export const browser = browserEventListener<WindowsOnCreated>()
export const main = mainEventListener<WindowsOnCreated>()
