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
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed'
import LocatorBuilders from './locator-builders'
import TargetSelector from './target-selector'

const locatorBuilders = new LocatorBuilders(window)

window.addEventListener('message', event => {
  if (
    event.data &&
    event.data.direction === 'from-page-script' &&
    event.data.action === 'find'
  ) {
    const element = window.document.querySelector(event.data.query)
    highlight(element).then(() => {
      event.source.postMessage(
        {
          id: event.data.id,
          direction: 'from-content-script',
        },
        '*'
      )
    })
  }
})

let targetSelector

browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'select') {
    sendResponse(true)
    if (message.selecting) {
      startSelection()
    } else {
      cleanSelection()
    }
  }
})

browser.runtime
  .sendMessage({
    attachSelectorRequest: true,
  })
  .then(shouldAttach => {
    if (shouldAttach) {
      startSelection()
    }
  })
  .catch(() => {})

function startSelection() {
  targetSelector = new TargetSelector(function(element, win) {
    if (element && win) {
      const target = locatorBuilders.buildAll(element)
      if (target != null && target instanceof Array) {
        if (target) {
          browser.runtime.sendMessage({
            action: 'select',
            selectTarget: true,
            target,
          })
        }
      }
    }
    targetSelector = null
  })
}

function cleanSelection() {
  targetSelector.cleanup()
  targetSelector = null
}

function highlight(element) {
  return new Promise(res => {
    const elementForInjectingStyle = document.createElement('link')
    elementForInjectingStyle.rel = 'stylesheet'
    elementForInjectingStyle.href = browser.runtime.getURL(
      '/assets/highlight.css'
    )
    ;(document.head || document.documentElement).appendChild(
      elementForInjectingStyle
    )
    const highlightElement = document.createElement('div')
    highlightElement.id = 'selenium-highlight'
    document.body.appendChild(highlightElement)
    const bodyRects = document.documentElement.getBoundingClientRect()
    const elementRects = element.getBoundingClientRect()
    highlightElement.style.left =
      parseInt(elementRects.left - bodyRects.left) + 'px'
    highlightElement.style.top =
      parseInt(elementRects.top - bodyRects.top) + 'px'
    highlightElement.style.width = parseInt(elementRects.width) + 'px'
    highlightElement.style.height = parseInt(elementRects.height) + 'px'
    highlightElement.style.position = 'absolute'
    highlightElement.style.zIndex = '100'
    highlightElement.style.display = 'block'
    highlightElement.style.pointerEvents = 'none'
    scrollIntoViewIfNeeded(highlightElement, { centerIfNeeded: true })
    highlightElement.className = 'active-selenium-highlight'
    setTimeout(() => {
      document.body.removeChild(highlightElement)
      elementForInjectingStyle.parentNode.removeChild(elementForInjectingStyle)
      res()
    }, 500)
  })
}
