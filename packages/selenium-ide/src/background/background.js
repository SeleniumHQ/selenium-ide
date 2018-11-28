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
import { isStaging } from '../common/utils'

let ideWindowId = undefined
let master = {}
let clickEnabled = true

window.master = master
window.openedWindowIds = []

if (isStaging) openPanel({ windowId: 0 })

function openPanel(tab) {
  let contentWindowId = tab.windowId
  if (ideWindowId) {
    browser.windows
      .update(ideWindowId, {
        focused: true,
      })
      .catch(function() {
        ideWindowId == undefined
        openPanel(tab)
      })
    return
  } else if (!clickEnabled) {
    return
  }

  clickEnabled = false
  setTimeout(function() {
    clickEnabled = true
  }, 1000)

  openWindowFromStorageResolution()
    .then(function waitForPanelLoaded(panelWindowInfo) {
      return new Promise(function(resolve, reject) {
        let count = 0
        let interval = setInterval(function() {
          if (count > 100) {
            reject('SideeX editor has no response')
            clearInterval(interval)
          }

          browser.tabs
            .query({
              active: true,
              windowId: panelWindowInfo.id,
              status: 'complete',
            })
            .then(function(tabs) {
              if (tabs.length != 1) {
                count++
                return
              } else {
                master[contentWindowId] = panelWindowInfo.id
                resolve(panelWindowInfo)
                clearInterval(interval)
              }
            })
        }, 200)
      })
    })
    .then(function bridge(panelWindowInfo) {
      ideWindowId = panelWindowInfo.id
      return browser.tabs.sendMessage(panelWindowInfo.tabs[0].id, {
        selfWindowId: panelWindowInfo.id,
        commWindowId: contentWindowId,
      })
    })
    .catch(function(e) {
      console.log(e) // eslint-disable-line no-console
    })
}

function openWindowFromStorageResolution() {
  let opts = {
    height: 690,
    width: 550,
  }
  return browser.storage.local
    .get()
    .then(storage => {
      if (sizeIsValid(storage.size)) {
        opts.height = storage.size.height
        opts.width = storage.size.width
      }
      if (originIsValid(storage.origin)) {
        opts.top = storage.origin.top
        opts.left = storage.origin.left
      }
      return browser.windows.create(
        Object.assign(
          {
            url: browser.extension.getURL('index.html'),
            type: 'popup',
          },
          opts
        )
      )
    })
    .catch(e => {
      console.error(e) // eslint-disable-line no-console
      return browser.windows.create(
        Object.assign(
          {
            url: browser.extension.getURL('index.html'),
            type: 'popup',
          },
          opts
        )
      )
    })
}

function sizeIsValid(size) {
  return size && sideIsValid(size.height) && sideIsValid(size.width)
}

function sideIsValid(number) {
  return number && number.constructor.name === 'Number' && number > 50
}

function originIsValid(origin) {
  return origin && pointIsValid(origin.top) && pointIsValid(origin.left)
}

function pointIsValid(point) {
  return point >= 0 && point.constructor.name === 'Number'
}

browser.browserAction.onClicked.addListener(openPanel)

browser.windows.onRemoved.addListener(function(windowId) {
  let keys = Object.keys(master)
  for (let key of keys) {
    if (master[key] === windowId) {
      delete master[key]
      if (keys.length === 1) {
        browser.contextMenus.removeAll()
      }
    }
  }
  if (windowId === ideWindowId) {
    ideWindowId = undefined
    Promise.all(
      window.openedWindowIds.map(windowId =>
        browser.windows.remove(windowId).catch(() => {
          /* Window was removed previously by the user */
        })
      )
    ).then(() => {
      window.openedWindowIds = []
    })
  }
})

let port

browser.contextMenus.onClicked.addListener(function(info) {
  port.postMessage({ cmd: info.menuItemId })
})

browser.runtime.onConnect.addListener(function(m) {
  port = m
})

browser.runtime.onMessageExternal.addListener(
  (message, sender, sendResponse) => {
    if (!message.payload) {
      message.payload = {}
    }
    message.payload.sender = sender.id
    browser.runtime
      .sendMessage(message)
      .then(sendResponse)
      .catch(() => {
        return sendResponse({ error: 'Selenium IDE is not active' })
      })
    return true
  }
)

browser.runtime.onInstalled.addListener(() => {
  // Notify updates only in production
  if (process.env.NODE_ENV === 'production') {
    browser.storage.local.set({
      updated: true,
    })
  }
})
