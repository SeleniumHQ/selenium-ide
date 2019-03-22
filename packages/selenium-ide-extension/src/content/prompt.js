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

const originalPrompt = window.prompt
let nextPromptResult = false
let recordedPrompt = null

const originalConfirmation = window.confirm
let nextConfirmationResult = false
let recordedConfirmation = null

const originalAlert = window.alert
let recordedAlert = null

function getFrameLocation() {
  let frameLocation = ''
  let currentWindow = window
  let currentParentWindow
  while (currentWindow !== window.top) {
    currentParentWindow = currentWindow.parent
    for (let idx = 0; idx < currentParentWindow.frames.length; idx++)
      if (currentParentWindow.frames[idx] === currentWindow) {
        frameLocation = ':' + idx + frameLocation
        currentWindow = currentParentWindow
        break
      }
  }
  frameLocation = 'root' + frameLocation
  return frameLocation
}

//before record prompt

// Not a top window
if (window !== window.top) {
  window.prompt = function(text, defaultText) {
    if (document.body.hasAttribute('SideeXPlayingFlag')) {
      return window.top.prompt(text, defaultText)
    } else {
      let result = originalPrompt(text, defaultText)
      let frameLocation = getFrameLocation()
      window.top.postMessage(
        {
          direction: 'from-page-script',
          recordedType: 'prompt',
          recordedMessage: text,
          recordedResult: result,
          frameLocation: frameLocation,
        },
        '*'
      )
      return result
    }
  }

  window.confirm = function(text) {
    if (document.body.hasAttribute('SideeXPlayingFlag')) {
      return window.top.confirm(text)
    } else {
      let result = originalConfirmation(text)
      let frameLocation = getFrameLocation()
      window.top.postMessage(
        {
          direction: 'from-page-script',
          recordedType: 'confirm',
          recordedMessage: text,
          recordedResult: result,
          frameLocation: frameLocation,
        },
        '*'
      )
      return result
    }
  }

  window.alert = function(text) {
    if (document.body.hasAttribute('SideeXPlayingFlag')) {
      recordedAlert = text
      // Response directly
      window.top.postMessage(
        {
          direction: 'from-page-script',
          response: 'alert',
          value: recordedAlert,
        },
        '*'
      )
      return
    } else {
      let result = originalAlert(text)
      let frameLocation = getFrameLocation()
      window.top.postMessage(
        {
          direction: 'from-page-script',
          recordedType: 'alert',
          recordedMessage: text,
          recordedResult: result,
          frameLocation: frameLocation,
        },
        '*'
      )
      return result
    }
  }
} else {
  // top window

  window.prompt = function(text, defaultText) {
    recordedPrompt = text
    if (document.body.hasAttribute('setPrompt')) {
      document.body.removeAttribute('setPrompt')
      return nextPromptResult
    } else {
      let result = originalPrompt(text, defaultText)
      let frameLocation = getFrameLocation()
      window.top.postMessage(
        {
          direction: 'from-page-script',
          recordedType: 'prompt',
          recordedMessage: text,
          recordedResult: result,
          frameLocation: frameLocation,
        },
        '*'
      )
      return result
    }
  }
  window.confirm = function(text) {
    recordedConfirmation = text
    if (document.body.hasAttribute('setConfirm')) {
      document.body.removeAttribute('setConfirm')
      return nextConfirmationResult
    } else {
      let result = originalConfirmation(text)
      let frameLocation = getFrameLocation()
      window.top.postMessage(
        {
          direction: 'from-page-script',
          recordedType: 'confirm',
          recordedMessage: text,
          recordedResult: result,
          frameLocation: frameLocation,
        },
        '*'
      )
      return result
    }
  }
  window.alert = function(text) {
    recordedAlert = text
    if (document.body.hasAttribute('SideeXPlayingFlag')) {
      // Response directly
      window.top.postMessage(
        {
          direction: 'from-page-script',
          response: 'alert',
          value: recordedAlert,
        },
        '*'
      )
      return
    } else {
      let result = originalAlert(text)
      let frameLocation = getFrameLocation()
      window.top.postMessage(
        {
          direction: 'from-page-script',
          recordedType: 'alert',
          recordedMessage: text,
          recordedResult: result,
          frameLocation: frameLocation,
        },
        '*'
      )
      return result
    }
  }
}

//play window methods
if (window == window.top) {
  window.addEventListener('message', handler)
}

function handler(event) {
  if (
    event.source == window &&
    event.data &&
    event.data.direction == 'from-content-script'
  ) {
    if (event.data.detach) {
      window.removeEventListener('message', handler)
      window.prompt = originalPrompt
      window.confirm = originalConfirmation
      window.alert = originalAlert
      return
    }
    let result = undefined
    switch (event.data.command) {
      case 'setNextPromptResult':
        nextPromptResult = event.data.target
        document.body.setAttribute('setPrompt', true)
        window.postMessage(
          {
            direction: 'from-page-script',
            response: 'prompt',
          },
          '*'
        )
        break
      case 'getPromptMessage':
        result = recordedPrompt
        recordedPrompt = null
        window.postMessage(
          {
            direction: 'from-page-script',
            response: 'prompt',
            value: result,
          },
          '*'
        )
        break
      case 'setNextConfirmationResult':
        nextConfirmationResult = event.data.target
        document.body.setAttribute('setConfirm', true)
        window.postMessage(
          {
            direction: 'from-page-script',
            response: 'confirm',
          },
          '*'
        )
        break
      case 'getConfirmationMessage':
        result = recordedConfirmation
        recordedConfirmation = null
        try {
          window.postMessage(
            {
              direction: 'from-page-script',
              response: 'confirm',
              value: result,
            },
            '*'
          )
        } catch (e) {} // eslint-disable-line no-empty
        break

      case 'setNextAlertResult':
        document.body.setAttribute('setAlert', true)
        window.postMessage(
          {
            direction: 'from-page-script',
            response: 'alert',
          },
          '*'
        )
        break
    }
  }
}
