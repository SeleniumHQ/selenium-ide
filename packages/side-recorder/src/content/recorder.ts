// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import browser from 'webextension-polyfill'
import { handlers, observers } from './record-handlers'
import { attach, detach } from './prompt-injector'
import {
  EventHandler,
  ExpandedMessageEvent,
  ExpandedMessageHandler,
  ExpandedMutationObserver,
} from '../types'

export interface RecordingState {
  typeTarget: HTMLElement | null
  typeLock: number
  focusTarget: HTMLInputElement | null
  focusValue: string | null
  tempValue: string | null
  preventType: boolean
  preventClickTwice: boolean
  preventClick: boolean
  enterTarget: HTMLElement | null
  enterValue: string | null
  tabCheck: HTMLElement | null
}

/**
 * @param {Window} window
 */
export default class Recorder {
  constructor(window: Window) {
    this.window = window
    this.eventListeners = {}
    this.attached = false
    this.frameLocation = ''
    this.inputTypes = Recorder.inputTypes
    this.recalculateFrameLocation = this.recalculateFrameLocation.bind(this)
    this.attachRecorderHandler = this.attachRecorderHandler.bind(this)
    this.detachRecorderHandler = this.detachRecorderHandler.bind(this)
    this.setWindowHandle = this.setWindowHandle.bind(this)

    this.window.addEventListener('message', this.setActiveContext)
    // @ts-expect-error
    this.window.addEventListener('message', this.setWindowHandle)
    // @ts-expect-error
    browser.runtime.onMessage.addListener(this.recalculateFrameLocation)
    // @ts-expect-error
    browser.runtime.onMessage.addListener(this.attachRecorderHandler)
    // @ts-expect-error
    browser.runtime.onMessage.addListener(this.detachRecorderHandler)
    // @ts-expect-error
    this.recordingState = {}

    browser.runtime
      .sendMessage({
        attachRecorderRequest: true,
      })
      .then((shouldAttach) => {
        if (shouldAttach) {
          this.addRecorderTracingAttribute()
          this.attach()
        }
      })
      .catch(() => {})

    // runs in the content script of each frame
    // e.g., once on load
    ;(async () => {
      await this.getFrameLocation()
    })()
  }
  window: Window
  eventListeners: Record<string, EventListener[]>
  attached: boolean = false
  recordingState: RecordingState
  frameLocation: string
  inputTypes: any[]
  addRecorderTracingAttribute() {
    this.window.document.body.setAttribute('data-side-attach-once-loaded', '')
  }

  attachRecorderHandler: ExpandedMessageHandler = (
    message,
    _sender,
    sendResponse
  ) => {
    if (message.attachRecorder) {
      this.attach()
      sendResponse(true)
    }
  }

  detachRecorderHandler: ExpandedMessageHandler = (
    message,
    _sender,
    sendResponse
  ) => {
    if (message.detachRecorder) {
      this.detach()
      sendResponse(true)
    }
  }

  /* record */
  record(
    command: string,
    target: string | string[][],
    value: string | string[][],
    insertBeforeLastCommand: boolean = false,
    actualFrameLocation?: string
  ) {
    return browser.runtime
      .sendMessage({
        command,
        target,
        value,
        insertBeforeLastCommand,
        frameLocation:
          actualFrameLocation != undefined
            ? actualFrameLocation
            : this.frameLocation,
      })
      .catch(() => {
        this.detach()
      })
  }

  setWindowHandle(event: ExpandedMessageEvent) {
    if (
      event.data &&
      event.data.direction === 'from-page-script' &&
      event.data.action === 'set-handle'
    ) {
      browser.runtime
        .sendMessage({
          setWindowHandle: true,
          handle: event.data.args.handle,
          sessionId: event.data.args.sessionId,
        })
        .then(() => {
          ;(event.source as Window).postMessage(
            {
              id: event.data.id,
              direction: 'from-content-script',
            },
            '*'
          )
        })
    }
  }

  setActiveContext(event: MessageEvent) {
    if (
      event.data &&
      event.data.direction === 'from-page-script' &&
      event.data.action === 'set-frame'
    ) {
      browser.runtime
        .sendMessage({
          setActiveContext: true,
          frameLocation: event.data.args.frameLocation,
          sessionId: event.data.args.sessionId,
        })
        .then(() => {
          ;(event.source as Window).postMessage(
            {
              id: event.data.id,
              direction: 'from-content-script',
            },
            '*'
          )
        })
    }
  }

  /**
   * @param {string} eventKey
   */
  parseEventKey(eventKey: string) {
    if (eventKey.match(/^C_/)) {
      return { eventName: eventKey.substring(2), capture: true }
    } else {
      return { eventName: eventKey, capture: false }
    }
  }

  attach() {
    if (!this.attached) {
      for (let eventKey in Recorder.eventHandlers) {
        const eventInfo = this.parseEventKey(eventKey)
        const eventName = eventInfo.eventName
        const capture = eventInfo.capture

        this.eventListeners[eventKey] = []
        const handlers = Recorder.eventHandlers[eventKey]
        for (let i = 0; i < handlers.length; i++) {
          this.window.document.addEventListener(
            eventName,
            handlers[i].bind(this),
            capture
          )
          this.eventListeners[eventKey].push(handlers[i])
        }
      }
      for (let observerName in Recorder.mutationObservers) {
        const observer = Recorder.mutationObservers[observerName]
        observer.observe(this.window.document.body, observer.config)
      }
      this.attached = true
      this.recordingState = {
        typeTarget: null,
        typeLock: 0,
        focusTarget: null,
        focusValue: null,
        tempValue: null,
        preventType: false,
        preventClickTwice: false,
        preventClick: false,
        enterTarget: null,
        enterValue: null,
        tabCheck: null,
      }
      attachInputListeners(this.recordingState, this.window)
      attach(this.record.bind(this))
    }
  }

  detach() {
    for (let eventKey in this.eventListeners) {
      const eventInfo = this.parseEventKey(eventKey)
      const eventName = eventInfo.eventName
      const capture = eventInfo.capture
      for (let i = 0; i < this.eventListeners[eventKey].length; i++) {
        this.window.document.removeEventListener(
          eventName,
          this.eventListeners[eventKey][i],
          capture
        )
      }
    }
    for (let observerName in Recorder.mutationObservers) {
      const observer = Recorder.mutationObservers[observerName]
      observer.disconnect()
    }
    this.eventListeners = {}
    this.attached = false
    detachInputListeners(this.recordingState, this.window)
    detach()
  }

  // set frame id
  getFrameLocation() {
    let currentWindow = this.window
    let currentParentWindow

    while (currentWindow !== this.window.top) {
      currentParentWindow = currentWindow.parent
      if (!currentParentWindow.frames.length) {
        break
      }

      for (let idx = 0; idx < currentParentWindow.frames.length; idx++) {
        const frame = currentParentWindow.frames[idx]

        if (frame === currentWindow) {
          this.frameLocation = ':' + this.frameLocation
          currentWindow = currentParentWindow
          break
        }
      }
    }
    this.frameLocation = 'root' + this.frameLocation
    return browser.runtime
      .sendMessage({ frameLocation: this.frameLocation })
      .catch(() => {})
  }

  recalculateFrameLocation: ExpandedMessageHandler = (
    message,
    _sender,
    sendResponse
  ) => {
    if (message.recalculateFrameLocation) {
      ;(async () => {
        this.frameLocation = ''
        await this.getFrameLocation()
        sendResponse(true)
      })()
      return true
    }
    return undefined
  }

  static eventHandlers: Record<string, EventListener[]> = {}
  static mutationObservers: Record<string, ExpandedMutationObserver> = {}
  public static addEventHandler = function (
    handlerName: string,
    eventName: string,
    handler: EventHandler,
    options?: boolean
  ) {
    handler.handlerName = handlerName
    if (!options) options = false
    let key = options ? 'C_' + eventName : eventName
    if (!Recorder.eventHandlers[key]) {
      Recorder.eventHandlers[key] = []
    }
    Recorder.eventHandlers[key].push(handler)
  }

  public static addMutationObserver = function (
    observerName: string,
    callback: MutationCallback,
    config: any
  ) {
    const observer = new MutationObserver(callback) as ExpandedMutationObserver
    observer.observerName = observerName
    observer.config = config
    Recorder.mutationObservers[observerName] = observer
  }

  static inputTypes: string[] = [
    'text',
    'password',
    'file',
    'datetime',
    'datetime-local',
    'date',
    'month',
    'time',
    'week',
    'number',
    'range',
    'email',
    'url',
    'search',
    'tel',
    'color',
  ]
}
handlers.forEach((handler) => {
  Recorder.addEventHandler(...handler)
})

observers.forEach((observer) => {
  Recorder.addMutationObserver(...observer)
})

function updateInputElementsOfRelevantType(
  action: (el: HTMLInputElement) => void,
  win: Window
) {
  let inp = win.document.getElementsByTagName('input')
  for (let i = 0; i < inp.length; i++) {
    if (Recorder.inputTypes.indexOf(inp[i].type) >= 0) {
      action(inp[i])
    }
  }
}

function focusEvent(recordingState: RecordingState, event: FocusEvent) {
  const target = event.target as HTMLInputElement
  recordingState.focusTarget = target
  recordingState.focusValue = (event.target as HTMLInputElement).value || ''
  recordingState.tempValue = recordingState.focusValue
  recordingState.preventType = false
}

function blurEvent(recordingState: RecordingState) {
  recordingState.focusTarget = null
  recordingState.focusValue = null
  recordingState.tempValue = null
}

function attachInputListeners(recordingState: RecordingState, win: Window) {
  updateInputElementsOfRelevantType((input) => {
    input.addEventListener('focus', focusEvent.bind(null, recordingState))
    input.addEventListener('blur', blurEvent.bind(null, recordingState))
  }, win)
}

function detachInputListeners(recordingState: RecordingState, win: Window) {
  updateInputElementsOfRelevantType((input) => {
    input.removeEventListener('focus', focusEvent.bind(null, recordingState))
    input.removeEventListener('blur', blurEvent.bind(null, recordingState))
  }, win)
}
