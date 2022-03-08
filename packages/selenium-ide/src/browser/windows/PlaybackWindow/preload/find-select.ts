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

import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed'
import LocatorBuilders from './locator-builders'
import TargetSelector from './target-selector'
import sideAPI from 'browser/helpers/getSideAPI'

const locatorBuilders = new LocatorBuilders(window)

window.addEventListener('message', (event) => {
  if (
    event.data?.direction === 'from-page-script' &&
    event.data.action === 'find'
  ) {
    const element = window.document.querySelector(event.data.query)
    highlight(element).then(() => {
      (event.source as Window).postMessage(
        {
          id: event.data.id,
          direction: 'from-content-script',
        },
        {
          targetOrigin: '*'
        }
      )
    })
  }
})

let targetSelector: TargetSelector | null = null

sideAPI.recorder.onToggleSelectMode.addListener((selecting) => {
  if (selecting) {
    startSelection()
  } else {
    cleanSelection()
  }
})

function startSelection() {
  targetSelector = new TargetSelector(function (element, win) {
    if (element && win) {
      const target = locatorBuilders.buildAll(element)
      if (target != null && Array.isArray(target)) {
        sideAPI.recorder.onSelectElement.dispatchEvent(target)
      }
    }
    targetSelector = null
  })
}

function cleanSelection() {
  (targetSelector as TargetSelector).cleanup()
  targetSelector = null
}

function highlight(element: HTMLElement): Promise<void> {
  return new Promise((res) => {
    const highlightElement = document.createElement('div')
    highlightElement.id = 'selenium-highlight'
    document.body.appendChild(highlightElement)
    const bodyRects = document.documentElement.getBoundingClientRect()
    const elementRects = element.getBoundingClientRect()
    highlightElement.style.left =
      `${elementRects.left - bodyRects.left}px`
    highlightElement.style.top = `${elementRects.top - bodyRects.top}px`
    highlightElement.style.width = `${elementRects.width}px`
    highlightElement.style.height = `${elementRects.height}px`
    highlightElement.style.position = 'absolute'
    highlightElement.style.zIndex = '100'
    highlightElement.style.display = 'block'
    highlightElement.style.pointerEvents = 'none'
    scrollIntoViewIfNeeded(highlightElement, { block: 'center' })
    highlightElement.className = 'active-selenium-highlight'
    setTimeout(() => {
      document.body.removeChild(highlightElement)
      res()
    }, 500)
  })
}
