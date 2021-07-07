import browserEventListener from 'browser/polyfill/classes/EventListener'
import mainEventListener from 'main/polyfill/classes/EventListener'
import { TabData } from 'polyfill/types'

export interface MessageSender {
  frameId: number
  id: string
  nativeApplication: string
  origin: string
  tab: TabData
  tlsChannelId: string
  url: string
}
export interface OnMessageExternalData {
  sender: MessageSender
  sendResponse: (obj: any) => void
}

export const browser = browserEventListener<[OnMessageExternalData]>()

export const main = mainEventListener<[OnMessageExternalData]>()
