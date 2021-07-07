import browserEventListener from 'browser/polyfill/classes/EventListener'
import mainEventListener from 'main/polyfill/classes/EventListener'

export interface NavigationTarget {
  details: {
    sourceFrameId: number
    sourceProcessId: number
    sourceTabId: number
    tabId: number
    timeStamp: number
    url: string
  }
}

export type Args = [NavigationTarget]

export const browser = browserEventListener<[Args]>()

export const main = mainEventListener<[Args]>()
