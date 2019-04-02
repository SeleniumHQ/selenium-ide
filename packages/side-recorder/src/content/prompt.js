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

const originalPrompt = window.prompt
const originalConfirmation = window.confirm
const originalAlert = window.alert

if (window == window.top) {
  window.addEventListener('message', handler)
}

function handler(event) {
  if (
    event.source == window &&
    event.data &&
    event.data.direction == 'from-content-script'
  ) {
    if (event.data.attach) {
      attach()
    } else if (event.data.detach) {
      window.prompt = originalPrompt
      window.confirm = originalConfirmation
      window.alert = originalAlert
      return
    }
  }
}

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

window.__setWindowHandle = (handle, sessionId) => {
  let frameLocation = getFrameLocation()
  window.top.postMessage(
    {
      direction: 'from-page-script',
      recordedType: 'handle',
      recordedMessage: {
        handle,
        sessionId,
      },
      frameLocation,
    },
    '*'
  )
}

function attach() {
  window.prompt = function(text, defaultText) {
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
  window.confirm = function(text) {
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
  window.alert = function(text) {
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
