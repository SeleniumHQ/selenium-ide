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

import { handlers, observers } from './record-handlers'
import * as recordShortcuts from './record-shortcuts'
import { attach, detach } from './prompt-injector'
import {
  EventHandler,
  ExpandedMessageEvent,
  ExpandedMutationObserver,
} from 'browser/types'
import initFindSelect from './find-select'
import { RecordNewCommandInput, RecorderPreprocessor } from '@seleniumhq/side-api'
import LocatorBuilders from './locator-builders'

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
  constructor(window: Window, recorderPreprocessors: RecorderPreprocessor[]) {
    this.window = window
    this.recorderPreprocessors = recorderPreprocessors
    this.eventListeners = {}
    this.attached = false
    this.frameLocation = ''
    this.inputTypes = Recorder.inputTypes

    this.getFrameLocation = this.getFrameLocation.bind(this)
    this.setWindowHandle = this.setWindowHandle.bind(this)
    // @ts-expect-error
    this.recordingState = {}
    this.addRecorderTracingAttribute()
    initFindSelect()
    // e.g., once on load
    this.getFrameLocation()

    this.window.sideAPI.recorder.getWinHandleId().then((id) => {
      this.winHandleId = id
    })
    handlers.forEach((handler) => {
      this.addEventHandler(...handler)
    })
    observers.forEach((observer) => {
      this.addMutationObserver(...observer)
    })
  }

  winHandleId: string = ''
  recorderPreprocessors: RecorderPreprocessor[]
  window: Window
  eventListeners: Record<string, EventListener[]>
  attached: boolean = false
  recordingState: RecordingState
  frameLocation: string
  inputTypes: any[]

  addRecorderTracingAttribute() {
    this.window.document.body.setAttribute('data-side-attach-once-loaded', '')
  }

  record(
    event: Event | KeyboardEvent | MouseEvent | MutationRecord[] | undefined,
    command: string,
    target: string | [string, string][],
    value: string | [string, string][],
    insertBeforeLastCommand = false,
    actualFrameLocation: string | null = null,
    overrideRecorder = false
  ) {
    let newCommand: RecordNewCommandInput = {
      command,
      target,
      value,
      insertBeforeLastCommand,
      frameLocation: actualFrameLocation || this.frameLocation,
      winHandleId: this.winHandleId,
    }
    const preprocessors = this.recorderPreprocessors
    for (let i = 0, ii = preprocessors.length; i !== ii; i++) {
      const preprocessor = preprocessors[i]
      const result = preprocessor(newCommand, event)
      if (!result) continue
      switch (result.action) {
        case 'drop':
          return
        case 'update':
          newCommand = result.command
      }
    }
    window.sideAPI.recorder.recordNewCommand(newCommand, overrideRecorder)
  }

  setWindowHandle(event: ExpandedMessageEvent) {
    if (
      event.data &&
      event.data.direction === 'from-page-script' &&
      event.data.action === 'set-handle'
    ) {
      window.sideAPI.recorder
        .setWindowHandle(event.data.args.sessionId, event.data.args.handle)
        .then(() => {
          const source = event.source as Window
          source.postMessage(
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
      // @ts-expect-error
      this.window.addEventListener('message', this.setWindowHandle)
      this.window.sideAPI.recorder.onFrameRecalculate.addListener(
        this.getFrameLocation
      )
      this.window.sideAPI.recorder.onLocatorOrderChanged.addListener(
        LocatorBuilders.setPreferredOrder
      )
      for (let eventKey in this.eventHandlers) {
        const eventInfo = this.parseEventKey(eventKey)
        const eventName = eventInfo.eventName
        const capture = eventInfo.capture

        this.eventListeners[eventKey] = []
        const handlers = this.eventHandlers[eventKey]
        for (let i = 0; i < handlers.length; i++) {
          this.window.document.addEventListener(
            eventName,
            handlers[i].bind(this),
            capture
          )
          this.eventListeners[eventKey].push(handlers[i])
        }
      }
      for (let observerName in this.mutationObservers) {
        const observer = this.mutationObservers[observerName]
        observer.observe(window.document.body, observer.config)
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
      recordShortcuts.attach(this)
    }
  }

  detach() {
    // @ts-expect-error
    this.window.removeEventListener('message', this.setWindowHandle)
    this.window.sideAPI.recorder.onFrameRecalculate.removeListener(
      this.getFrameLocation
    )
    this.window.sideAPI.recorder.onLocatorOrderChanged.removeListener(
      LocatorBuilders.setPreferredOrder
    )
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
    for (let observerName in this.mutationObservers) {
      const observer = this.mutationObservers[observerName]
      observer.disconnect()
    }
    this.eventListeners = {}
    this.attached = false
    detachInputListeners(this.recordingState, this.window)
    detach()
    recordShortcuts.detach()
  }

  // set frame id
  async getFrameLocation() {
    this.frameLocation = await window.sideAPI.recorder.getFrameLocation()
  }

  eventHandlers: Record<string, EventHandler[]> = {}
  mutationObservers: Record<string, ExpandedMutationObserver> = {}
  addEventHandler(
    handlerName: string,
    eventName: string,
    handler: EventHandler,
    capture = false
  ) {
    handler.handlerName = handlerName
    let key = capture ? 'C_' + eventName : eventName
    if (!this.eventHandlers[key]) {
      this.eventHandlers[key] = []
    }
    this.eventHandlers[key].push(handler)
  }

  addMutationObserver(
    observerName: string,
    callback: MutationCallback,
    config: any
  ) {
    const observer = new MutationObserver(
      callback.bind(this)
    ) as ExpandedMutationObserver
    observer.observerName = observerName
    observer.config = config
    this.mutationObservers[observerName] = observer
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
