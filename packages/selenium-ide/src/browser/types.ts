import { CoreSessionData } from 'api/types'
import { BrowserWindowConstructorOptions, Menu } from 'electron'
import { Session } from 'main/types'
import Api from './api'
import ApiMutators from './api/mutator'
import Recorder from './windows/PlaybackWindow/preload/recorder'

declare global {
  interface Window {
    __originalPrompt: typeof window['prompt']
    __originalConfirmation: typeof window['confirm']
    __originalAlert: typeof window['alert']
    sideAPI: FullBrowserAPI
  }
}

export type FullBrowserAPI = typeof Api & { mutators: typeof ApiMutators }

export type CurriedApiField<Config extends any[], Shape> = (
  ...args: Config
) => (name: string, context: Session | Window) => Shape

export interface WindowConfig {
  menus?: (menu: Menu) => void
  window: (session: Session) => BrowserWindowConstructorOptions
}

export interface BrowserState extends CoreSessionData {}

export type EventFunction = (
  message: MessageEvent<any> & Record<string, any>,
  _sender: Window,
  sendResponse: (str: string) => void
) => void

export type EventHandler = EventListener & Partial<{ handlerName: string }>
export type ExpandedMessageEvent<EVENT = MessageEvent> = EVENT & {
  attachRecorder: boolean
  detachRecorder: boolean
  recalculateFrameLocation: boolean
}
export type ExpandedMessageHandler<EVENT = MessageEvent> = (
  this: Recorder,
  message: ExpandedMessageEvent<EVENT>,
  _sender: Window,
  sendResponse: (success: boolean | void) => boolean | void,
  options?: boolean
) => void
export type ExpandedMutationObserver = MutationObserver & {
  config: any
  observerName: string
}
