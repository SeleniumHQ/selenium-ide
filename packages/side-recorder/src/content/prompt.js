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

window.__side = {}

window.__side.originalPrompt = window.prompt
window.__side.originalConfirmation = window.confirm
window.__side.originalAlert = window.alert

window.__side.id = 0
window.__side.promises = {}

window.__side.postMessage = async (target, message) => {
  window.__side.id++
  const p = new Promise((res, rej) => {
    window.__side.promises[window.__side.id] = { res, rej }
  })
  target.postMessage(
    {
      ...message,
      direction: 'from-page-script',
      id: window.__side.id,
    },
    '*'
  )

  return p
}

window.addEventListener('message', event => {
  if (
    event.source == window &&
    event.data &&
    event.data.direction == 'from-content-script' &&
    event.data.id
  ) {
    if (event.data.error) {
      window.__side.promises[event.data.id].rej(new Error(event.data.message))
    } else {
      window.__side.promises[event.data.id].res(event.data.result)
    }
    // potential memory leak so using delete
    delete window.__side.promises[event.data.id]
  }
})

if (window == window.top) {
  window.addEventListener('message', window.__side.handler)
}

window.__side.handler = event => {
  if (
    event.source == window &&
    event.data &&
    event.data.direction == 'from-content-script'
  ) {
    if (event.data.attach) {
      window.__side.attach()
    } else if (event.data.detach) {
      window.prompt = window.__side.originalPrompt
      window.confirm = window.__side.originalConfirmation
      window.alert = window.__side.originalAlert
      return
    }
  }
}

window.__side.getFrameLocation = () => {
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

window.__side.setWindowHandle = (handle, sessionId) => {
  let frameLocation = window.__side.getFrameLocation()
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

window.__side.highlight = async element => {
  element.setAttribute('data-side-highlight', '')
  await window.__side.postMessage(window, {
    action: 'find',
    query: '*[data-side-highlight]',
  })
  element.removeAttribute('data-side-highlight')
}

window.__side.attach = () => {
  window.prompt = function(text, defaultText) {
    let result = window.__side.originalPrompt(text, defaultText)
    let frameLocation = window.__side.getFrameLocation()
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
    let result = window.__side.originalConfirmation(text)
    let frameLocation = window.__side.getFrameLocation()
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
    let result = window.__side.originalAlert(text)
    let frameLocation = window.__side.getFrameLocation()
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
