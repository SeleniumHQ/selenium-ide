import Recorder from './content/recorder'

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
