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
import { calculateFrameIndex } from './utils'
import { handlers, observers } from './record-handlers'
import { attach, detach } from './prompt-injector'

/**
 * @param {Window} window
 */
export default class Recorder {
  constructor(window) {
    this.window = window
    this.eventListeners = {}
    this.attached = false
    this.recordingState = {}
    this.frameLocation = ''
    this.recordingIndicator = undefined
    this.inputTypes = Recorder.inputTypes
    this.recalculateFrameLocation = this.recalculateFrameLocation.bind(this)
    this.attachRecorderHandler = this.attachRecorderHandler.bind(this)
    this.detachRecorderHandler = this.detachRecorderHandler.bind(this)

    browser.runtime.onMessage.addListener(this.recalculateFrameLocation)
    browser.runtime.onMessage.addListener(this.attachRecorderHandler)
    browser.runtime.onMessage.addListener(this.detachRecorderHandler)

    browser.runtime
      .sendMessage({
        attachRecorderRequest: true,
      })
      .then(shouldAttach => {
        if (shouldAttach) {
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

  attachRecorderHandler(message, _sender, sendResponse) {
    if (message.attachRecorder) {
      this.attach()
      sendResponse(true)
    }
  }

  detachRecorderHandler(message, _sender, sendResponse) {
    if (message.detachRecorder) {
      this.detach()
      sendResponse(true)
    }
  }

  /* record */
  record(command, target, value, insertBeforeLastCommand, actualFrameLocation) {
    browser.runtime
      .sendMessage({
        command: command,
        target: target,
        value: value,
        insertBeforeLastCommand: insertBeforeLastCommand,
        frameLocation:
          actualFrameLocation != undefined
            ? actualFrameLocation
            : this.frameLocation,
      })
      .catch(() => {
        this.detach()
      })
  }

  /**
   * @param {string} eventKey
   */
  parseEventKey(eventKey) {
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

        const handlers = Recorder.eventHandlers[eventKey]
        this.eventListeners[eventKey] = []
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
        typeTarget: undefined,
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
      this.addRecordingIndicator()
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
    this.removeRecordingIndicator()
    detachInputListeners(this.recordingState, this.window)
    detach()
  }

  getFrameCount() {
    return browser.runtime.sendMessage({
      requestFrameCount: true,
    })
  }

  addRecordingIndicator() {
    if (this.frameLocation === 'root' && !this.recordingIndicator) {
      const indicatorIndex = this.window.parent.frames.length
      this.recordingIndicator = this.window.document.createElement('iframe')
      this.recordingIndicator.src = browser.runtime.getURL('/indicator.html')
      this.recordingIndicator.id = 'selenium-ide-indicator'
      this.recordingIndicator.style.border = '1px solid #d30100'
      this.recordingIndicator.style.borderRadius = '50px'
      this.recordingIndicator.style.position = 'fixed'
      this.recordingIndicator.style.bottom = '36px'
      this.recordingIndicator.style.right = '36px'
      this.recordingIndicator.style.width = '400px'
      this.recordingIndicator.style.height = '50px'
      this.recordingIndicator.style['background-color'] = '#f7f7f7'
      this.recordingIndicator.style['box-shadow'] =
        '0 7px 10px 0 rgba(0,0,0,0.1)'
      this.recordingIndicator.style.transition = 'bottom 100ms linear'
      this.recordingIndicator.style['z-index'] = 1000000000000000
      this.recordingIndicator.addEventListener(
        'mouseenter',
        function(event) {
          event.target.style.visibility = 'hidden'
          setTimeout(function() {
            event.target.style.visibility = 'visible'
          }, 1000)
        },
        false
      )
      this.window.document.body.appendChild(this.recordingIndicator)
      browser.runtime.onMessage.addListener(function(
        message,
        sender, // eslint-disable-line
        sendResponse
      ) {
        if (message.recordNotification) {
          this.recordingIndicator.contentWindow.postMessage(
            {
              direction: 'from-recording-module',
              command: message.command,
              target: message.target,
              value: message.value,
            },
            '*'
          )
          this.recordingIndicator.style.borderColor = 'black'
          setTimeout(() => {
            this.recordingIndicator.style.borderColor = '#d30100'
          }, 1000)
          sendResponse(true)
        }
      })
      return browser.runtime
        .sendMessage({
          setFrameNumberForTab: true,
          indicatorIndex: indicatorIndex,
        })
        .catch(() => {})
    }
  }
  removeRecordingIndicator() {
    if (this.frameLocation === 'root' && this.recordingIndicator) {
      this.recordingIndicator.parentElement.removeChild(this.recordingIndicator)
      this.recordingIndicator = undefined
    }
  }

  // set frame id
  async getFrameLocation() {
    let currentWindow = this.window
    let currentParentWindow
    let recordingIndicatorIndex
    let frameCount

    while (currentWindow !== this.window.top) {
      currentParentWindow = currentWindow.parent
      if (!currentParentWindow.frames.length) {
        break
      }

      if (currentParentWindow === this.window.top) {
        frameCount = await this.getFrameCount().catch(() => {})
        if (frameCount) recordingIndicatorIndex = frameCount.indicatorIndex
      }

      for (let idx = 0; idx < currentParentWindow.frames.length; idx++) {
        const frame = currentParentWindow.frames[idx]

        if (frame === currentWindow) {
          this.frameLocation =
            ':' +
            calculateFrameIndex({
              indicatorIndex: recordingIndicatorIndex,
              targetFrameIndex: idx,
            }) +
            this.frameLocation
          currentWindow = currentParentWindow
          break
        }
      }
    }
    this.frameLocation = 'root' + this.frameLocation
    await browser.runtime
      .sendMessage({ frameLocation: this.frameLocation })
      .catch(() => {})
  }

  recalculateFrameLocation(message, _sender, sendResponse) {
    if (message.recalculateFrameLocation) {
      ;(async () => {
        this.removeRecordingIndicator()
        setTimeout(async () => {
          await this.addRecordingIndicator()
        }, 100)
        this.frameLocation = ''
        await this.getFrameLocation()
        sendResponse(true)
      })()
      return true
    }
  }
}

/** @type {{ [key: string]: EventListener[] }} */
Recorder.eventHandlers = {}
/** @type {{ [observerName: string]: MutationObserver }} */
Recorder.mutationObservers = {}
/**
 * @param {string} handlerName
 * @param {string} eventName
 * @param {EventListener} handler
 * @param {boolean} options
 */
Recorder.addEventHandler = function(handlerName, eventName, handler, options) {
  handler.handlerName = handlerName
  if (!options) options = false
  let key = options ? 'C_' + eventName : eventName
  if (!this.eventHandlers[key]) {
    this.eventHandlers[key] = []
  }
  this.eventHandlers[key].push(handler)
}

/**
 * @param {string} observerName
 * @param {MutationCallback} callback
 */
Recorder.addMutationObserver = function(observerName, callback, config) {
  const observer = new MutationObserver(callback)
  observer.observerName = observerName
  observer.config = config
  this.mutationObservers[observerName] = observer
}

Recorder.inputTypes = [
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

handlers.forEach(handler => {
  Recorder.addEventHandler(...handler)
})

observers.forEach(observer => {
  Recorder.addMutationObserver(...observer)
})

function updateInputElementsOfRelevantType(action, win) {
  let inp = win.document.getElementsByTagName('input')
  for (let i = 0; i < inp.length; i++) {
    if (Recorder.inputTypes.indexOf(inp[i].type) >= 0) {
      action(inp[i])
    }
  }
}

function focusEvent(recordingState, event) {
  recordingState.focusTarget = event.target
  recordingState.focusValue = recordingState.focusTarget.value
  recordingState.tempValue = recordingState.focusValue
  recordingState.preventType = false
}

function blurEvent(recordingState) {
  recordingState.focusTarget = null
  recordingState.focusValue = null
  recordingState.tempValue = null
}

function attachInputListeners(recordingState, win) {
  updateInputElementsOfRelevantType(input => {
    input.addEventListener('focus', focusEvent.bind(null, recordingState))
    input.addEventListener('blur', blurEvent.bind(null, recordingState))
  }, win)
}

function detachInputListeners(recordingState, win) {
  updateInputElementsOfRelevantType(input => {
    input.removeEventListener('focus', focusEvent.bind(null, recordingState))
    input.removeEventListener('blur', blurEvent.bind(null, recordingState))
  }, win)
}
