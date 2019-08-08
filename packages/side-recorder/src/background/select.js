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

let selecting

export function select(tabId) {
  return new Promise((res, rej) => {
    ;(async () => {
      if (selecting) {
        await disableSelect()
        selecting.rej(new Error('Different call for selection sent'))
        // eslint-disable-next-line require-atomic-updates
        selecting = null
      }
      await browser.tabs.sendMessage(tabId, {
        action: 'select',
        selecting: true,
      })
      // eslint-disable-next-line require-atomic-updates
      selecting = {
        tabId,
        res,
        rej,
      }
    })()
  })
}

export async function cancelSelect() {
  if (selecting) {
    await disableSelect()
    // eslint-disable-next-line require-atomic-updates
    selecting = null
  }
}

async function disableSelect() {
  await browser.tabs
    .sendMessage(selecting.tabId, { action: 'select', selecting: false })
    .catch(() => {})
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (selecting && message.action === 'select') {
    disableSelect().then(() => {
      if (message.selectTarget) {
        selecting.res(message.target)
      } else {
        selecting.rej(new Error('Locator selection cancelled'))
      }

      selecting = null
      sendResponse(true)
    })
    return true
  } else if (selecting && message.attachSelectorRequest) {
    if (sender.tab.id === selecting.tabId) {
      sendResponse({ shouldAttach: true })
    } else {
      sendResponse({ shouldAttach: false })
    }
  }
})
