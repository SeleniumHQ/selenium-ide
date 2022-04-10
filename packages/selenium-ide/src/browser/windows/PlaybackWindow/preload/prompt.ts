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

interface SideModule {
  attach: () => void
  id: number
  getFrameLocation: () => string
  handler: (e: MessageEvent) => void
  highlight: (el: HTMLElement) => void
  postMessage: (
    target: Window,
    message: Record<string, any> & Partial<MessageEvent<any>>,
    optDomain?: string
  ) => Promise<Error | any>
  promises: Record<
    number,
    { rej: (e: Error) => void; res: (result: any) => void }
  >
  setWindowHandle: (handle: string, sessionId: string) => void
}

window.__originalPrompt = window.prompt
window.__originalConfirmation = window.confirm
window.__originalAlert = window.alert

const sideModule = {} as SideModule
sideModule.id = 0
sideModule.promises = {}
sideModule.postMessage = async (target, message, optDomain = '*') => {
  sideModule.id++
  const p = new Promise((res, rej) => {
    sideModule.promises[sideModule.id] = { res, rej }
  })
  target.postMessage(
    {
      ...message,
      direction: 'from-page-script',
      id: sideModule.id,
    },
    optDomain
  )

  return p
}

window.addEventListener('message', (event) => {
  if (
    event.source == window &&
    event.data &&
    event.data.direction == 'from-content-script' &&
    event.data.id
  ) {
    if (event.data.error) {
      sideModule.promises[event.data.id].rej(new Error(event.data.message))
    } else {
      sideModule.promises[event.data.id].res(event.data.result)
    }
    // potential memory leak so using delete
    delete sideModule.promises[event.data.id]
  }
})

sideModule.handler = (event) => {
  if (
    event.source == window &&
    event.data &&
    event.data.direction == 'from-content-script'
  ) {
    if (event.data.attach) {
      attach()
    } else if (event.data.detach) {
      detach
    }
  }
}

function attach() {
  sideModule.attach()
  removeRecorderTracingAttribute()
}

function detach() {
  window.prompt = window.__originalPrompt
  window.confirm = window.__originalConfirmation
  window.alert = window.__originalAlert
}

function autHasRecorderTracingAttribute() {
  return window.document.querySelector('[data-side-attach-once-loaded]')
}

function removeRecorderTracingAttribute() {
  if (autHasRecorderTracingAttribute())
    window.document.body.removeAttribute('data-side-attach-once-loaded')
}

if (window == window.top) {
  window.addEventListener('message', sideModule.handler)
}

sideModule.getFrameLocation = () => {
  let frameLocation = ''
  let currentWindow = window
  let currentParentWindow
  while (currentWindow !== window.top) {
    currentParentWindow = currentWindow.parent
    for (let idx = 0; idx < currentParentWindow.frames.length; idx++)
      if (currentParentWindow.frames[idx] === currentWindow) {
        frameLocation = '/' + idx + frameLocation
        currentWindow = currentParentWindow as Window & typeof globalThis
        break
      }
  }
  frameLocation = 'root' + frameLocation
  return frameLocation
}

sideModule.setWindowHandle = async (handle, sessionId) => {
  await sideModule.postMessage(
    window,
    {
      direction: 'from-page-script',
      action: 'set-handle',
      args: {
        handle,
        sessionId,
      },
    },
    '*'
  )
}

sideModule.highlight = async (element) => {
  element.setAttribute('data-side-highlight', '')
  await sideModule.postMessage(window, {
    action: 'find',
    query: '*[data-side-highlight]',
  })
  element.removeAttribute('data-side-highlight')
}

sideModule.attach = () => {
  window.prompt = function (text, defaultText) {
    let result = window.__originalPrompt(text, defaultText)
    let frameLocation = sideModule.getFrameLocation()
    window.top?.postMessage(
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
  window.confirm = function (text) {
    let result = window.__originalConfirmation(text)
    let frameLocation = sideModule.getFrameLocation()
    window.top?.postMessage(
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
  window.alert = function (text) {
    let result = window.__originalAlert(text)
    let frameLocation = sideModule.getFrameLocation()
    window.top?.postMessage(
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

if (autHasRecorderTracingAttribute()) attach()
