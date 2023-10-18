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

import { EventListenerParams, LocatorFields } from '@seleniumhq/side-api'
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed'
import {singleton as locatorBuilders} from './locator-builders'
import TargetSelector from './target-selector'

const init = () => {
  window.addEventListener('message', processMessage)
  window.sideAPI.recorder.onRequestSelectElement.addListener(
    processSelectionCommand
  )
  window.sideAPI.recorder.onHighlightElement.addListener(
    processHighlightCommand
  )
  window.addEventListener('beforeunload', () => {
    try {
      window.sideAPI.recorder.onRequestSelectElement.removeListener(
        processSelectionCommand
      )
      window.sideAPI.recorder.onHighlightElement.removeListener(
        processHighlightCommand
      )
    } catch (e) {
      // ignore
    }
  })
}

type RequestSelectElementHandlerParams = EventListenerParams<
  typeof window.sideAPI.recorder.onRequestSelectElement
>

function processSelectionCommand(
  selecting: RequestSelectElementHandlerParams[0],
  field: RequestSelectElementHandlerParams[1]
): void {
  if (selecting) {
    startSelection(field)
  } else {
    cleanSelection()
  }
}

let targetSelector: TargetSelector | null = null
function startSelection(field: LocatorFields) {
  targetSelector = new TargetSelector(function (element, win) {
    if (element && win) {
      const target = locatorBuilders.buildAll(element)
      if (target != null && Array.isArray(target)) {
        window.sideAPI.recorder.selectElement(field, target)
      }
    }
    targetSelector = null
  })
}

function cleanSelection() {
  if (targetSelector) {
    targetSelector.cleanup()
    targetSelector = null
  }
}

function processMessage(event: MessageEvent<any>) {
  if (
    event.data?.direction === 'from-page-script' &&
    event.data.action === 'find'
  ) {
    const element = window.document.querySelector(event.data.query)
    highlight(element).then(() => {
      ;(event.source as Window).postMessage(
        {
          id: event.data.id,
          direction: 'from-content-script',
        },
        {
          targetOrigin: '*',
        }
      )
    })
  }
}

async function processHighlightCommand(locator: string): Promise<void> {
  const element = await locatorBuilders.findElement(locator)
  console.log('Highlighting element', element)
  await highlight(element)
}

function highlight(element: HTMLElement): Promise<void> {
  return new Promise((res) => {
    const highlightElement = document.createElement('div')
    highlightElement.id = 'selenium-highlight'
    document.body.appendChild(highlightElement)
    const bodyRects = document.documentElement.getBoundingClientRect()
    const elementRects = element.getBoundingClientRect()
    highlightElement.style.left = `${elementRects.left - bodyRects.left}px`
    highlightElement.style.top = `${elementRects.top - bodyRects.top}px`
    highlightElement.style.width = `${elementRects.width}px`
    highlightElement.style.height = `${elementRects.height}px`
    highlightElement.style.position = 'absolute'
    highlightElement.style.zIndex = '100'
    highlightElement.style.display = 'block'
    highlightElement.style.pointerEvents = 'none'
    highlightElement.style.outline = '2px solid #a7f'
    highlightElement.style.opacity = '1'
    highlightElement.style.transition = 'opacity 3s'
    scrollIntoViewIfNeeded(highlightElement, { block: 'center' })
    setTimeout(() => {
      highlightElement.style.opacity = '0'
    }, 500)
    setTimeout(() => {
      document.body.removeChild(highlightElement)
      res()
    }, 3500)
  })
}

export default init
