/*
 * Copyright 2017 SideeX committers
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

import browser from 'webextension-polyfill'
import { calculateFrameIndex } from './utils'

let contentSideexTabId = -1
let frameLocation = ''

function Recorder(window) {
  this.window = window
  this.eventListeners = {}
  this.attached = false
}

Recorder.eventHandlers = {}
Recorder.mutationObservers = {}
Recorder.addEventHandler = function(handlerName, eventName, handler, options) {
  handler.handlerName = handlerName
  if (!options) options = false
  let key = options ? 'C_' + eventName : eventName
  if (!this.eventHandlers[key]) {
    this.eventHandlers[key] = []
  }
  this.eventHandlers[key].push(handler)
}

Recorder.addMutationObserver = function(observerName, callback, config) {
  const observer = new MutationObserver(callback)
  observer.observerName = observerName
  observer.config = config
  this.mutationObservers[observerName] = observer
}

Recorder.prototype.parseEventKey = function(eventKey) {
  if (eventKey.match(/^C_/)) {
    return { eventName: eventKey.substring(2), capture: true }
  } else {
    return { eventName: eventKey, capture: false }
  }
}

Recorder.prototype.attach = function() {
  if (!this.attached) {
    for (let eventKey in Recorder.eventHandlers) {
      const eventInfo = this.parseEventKey(eventKey)
      const eventName = eventInfo.eventName
      const capture = eventInfo.capture

      const handlers = Recorder.eventHandlers[eventKey]
      this.eventListeners[eventKey] = []
      for (let i = 0; i < handlers.length; i++) {
        this.window.document.addEventListener(eventName, handlers[i], capture)
        this.eventListeners[eventKey].push(handlers[i])
      }
    }
    for (let observerName in Recorder.mutationObservers) {
      const observer = Recorder.mutationObservers[observerName]
      observer.observe(this.window.document.body, observer.config)
    }
    this.attached = true
    addRecordingIndicator()
  }
}

Recorder.prototype.detach = function() {
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
  removeRecordingIndicator()
}

function attachRecorderHandler(message, _sender, sendResponse) {
  if (message.attachRecorder) {
    recorder.attach()
    sendResponse(true)
  }
}

function detachRecorderHandler(message, _sender, sendResponse) {
  if (message.detachRecorder) {
    recorder.detach()
    sendResponse(true)
  }
}

// recorder event handlers
browser.runtime.onMessage.addListener(attachRecorderHandler)
browser.runtime.onMessage.addListener(detachRecorderHandler)

function findRecordingIndicator() {
  try {
    return document.getElementById('selenium-ide-indicator')
  } catch (error) {
    return true
  }
}

function addRecordingIndicator() {
  if (!findRecordingIndicator() && frameLocation === 'root') {
    browser.runtime.sendMessage({
      setFrameNumberForTab: true,
      length: window.parent.frames.length,
    })
    let recordingIndicator = window.document.createElement('iframe')
    recordingIndicator.src = browser.runtime.getURL('/indicator.html')
    recordingIndicator.id = 'selenium-ide-indicator'
    recordingIndicator.style.border = '1px solid white'
    recordingIndicator.style.position = 'fixed'
    recordingIndicator.style.bottom = '36px'
    recordingIndicator.style.right = '36px'
    recordingIndicator.style.width = '280px'
    recordingIndicator.style.height = '80px'
    recordingIndicator.style['background-color'] = 'whitesmoke'
    recordingIndicator.style['box-shadow'] = '7px 7px 10px 0 rgba(0,0,0,0.3)'
    recordingIndicator.style.transition = 'bottom 100ms linear'
    recordingIndicator.style['z-index'] = 1000000000000000
    recordingIndicator.addEventListener(
      'mouseenter',
      function(event) {
        event.target.style.visibility = 'hidden'
        setTimeout(function() {
          event.target.style.visibility = 'visible'
        }, 1000)
      },
      false
    )
    window.document.body.appendChild(recordingIndicator)
    browser.runtime.onMessage.addListener(function(
      message,
      _sender,
      sendResponse
    ) {
      if (message.recordNotification) {
        recordingIndicator.contentWindow.postMessage(
          {
            direction: 'from-recording-module',
            command: message.command,
            target: message.target,
            value: message.value,
          },
          '*'
        )
        sendResponse(true)
      }
    })
  }
}

function removeRecordingIndicator() {
  let element = findRecordingIndicator()
  if (element) {
    element.parentElement.removeChild(element)
  }
}

// TODO: Decouple frame location from recording since its also used in playback
// and not obvious that that's happening (a.k.a. MAGIC!).
// set frame id
;(async function getframeLocation() {
  let currentWindow = window
  let currentParentWindow
  let recordingIndicator
  let recordingIndicatorIndex

  while (currentWindow !== window.top) {
    currentParentWindow = currentWindow.parent
    if (!currentParentWindow.frames.length) {
      break
    }

    try {
      recordingIndicator = currentParentWindow.document.getElementById(
        'selenium-ide-indicator'
      )
    } catch (e) {
      // If we got here looking for the indicator, its likely that we found it
      // but hit a CORS restriction. So we assume that's the case and set the
      // indicator variable to true.
      recordingIndicator = true
    }

    if (recordingIndicator) {
      recordingIndicatorIndex = await browser.runtime.sendMessage({
        requestFrameIndex: true,
      })
    }

    for (let idx = 0; idx < currentParentWindow.frames.length; idx++) {
      const frame = currentParentWindow.frames[idx]

      if (frame === currentWindow) {
        frameLocation =
          ':' +
          calculateFrameIndex(recordingIndicatorIndex, idx) +
          frameLocation
        currentWindow = currentParentWindow
        break
      }
    }
  }
  frameLocation = 'root' + frameLocation
})()

browser.runtime.sendMessage({ frameLocation: frameLocation }).catch(() => {})

const recorder = new Recorder(window)
window.recorder = recorder
window.contentSideexTabId = contentSideexTabId
window.Recorder = Recorder

/* record */
export function record(
  command,
  target,
  value,
  insertBeforeLastCommand,
  actualFrameLocation
) {
  browser.runtime
    .sendMessage({
      command: command,
      target: target,
      value: value,
      insertBeforeLastCommand: insertBeforeLastCommand,
      frameLocation:
        actualFrameLocation != undefined ? actualFrameLocation : frameLocation,
      commandSideexTabId: contentSideexTabId,
    })
    .catch(() => {
      recorder.detach()
    })
}

window.record = record

export { Recorder, recorder }
