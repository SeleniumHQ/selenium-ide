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
import { takeOpenedWindows } from '../common/opened-windows'

let clickEnabled = true

// The background can stop and start again at any time, so the IDE window id
// is kept in session storage instead of a variable.
async function getIdeWindowId() {
  const { ideWindowId } = await browser.storage.session.get('ideWindowId')
  return ideWindowId
}

function setIdeWindowId(windowId) {
  return serialize(
    () =>
      windowId === undefined
        ? browser.storage.session.remove('ideWindowId')
        : browser.storage.session.set({ ideWindowId: windowId })
  )
}

// Changes to the IDE window state run one at a time, so a check and the
// update that follows it can't interleave with another change.
let queue = Promise.resolve()
function serialize(fn) {
  const run = queue.then(fn)
  queue = run.catch(() => {})
  return run
}

// Clears the state of an IDE window that is gone: removes the context menus
// and closes the windows opened for playback. Does nothing if another IDE
// window has replaced it.
function endIdeSession(windowId) {
  return serialize(async () => {
    if (windowId !== (await getIdeWindowId())) return
    await browser.storage.session.remove('ideWindowId')
    browser.contextMenus.removeAll()
    const openedWindowIds = await takeOpenedWindows()
    await Promise.all(
      openedWindowIds.map(windowId =>
        browser.windows.remove(windowId).catch(() => {
          /* Window was removed previously by the user */
        })
      )
    )
  })
}

if (isStaging) {
  browser.runtime.onInstalled.addListener(() => openPanel({ windowId: 0 }))
}

async function openPanel(tab) {
  let contentWindowId = tab.windowId
  const ideWindowId = await getIdeWindowId()
  if (ideWindowId !== undefined) {
    try {
      await browser.windows.update(ideWindowId, {
        focused: true,
      })
      return
    } catch (e) {
      // The window was closed while the background was stopped
      await endIdeSession(ideWindowId)
    }
  }
  if (!clickEnabled) {
    return
  }

  clickEnabled = false
  setTimeout(function() {
    clickEnabled = true
  }, 1500)

  return openWindowFromStorageResolution()
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
                resolve(panelWindowInfo)
                clearInterval(interval)
              }
            })
        }, 200)
      })
    })
    .then(async function bridge(panelWindowInfo) {
      await setIdeWindowId(panelWindowInfo.id)
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
            url: browser.runtime.getURL('index.html'),
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
            url: browser.runtime.getURL('index.html'),
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

browser.action.onClicked.addListener(openPanel)

browser.windows.onRemoved.addListener(endIdeSession)

// The content script opens a port when the user opens the context menu, and
// the chosen menu item is sent back through it.
let port

browser.contextMenus.onClicked.addListener(function(info) {
  if (port) port.postMessage({ cmd: info.menuItemId })
})

browser.runtime.onConnect.addListener(function(m) {
  port = m
  m.onDisconnect.addListener(() => {
    if (port === m) port = undefined
  })
})

browser.runtime.onMessage.addListener(handleInternalMessage)

function handleInternalMessage(message) {
  if (message.restart && message.controller && message.controller.id) {
    setIdeWindowId(undefined).then(() =>
      browser.runtime
        .sendMessage({
          uri: '/private/close',
          verb: 'post',
          payload: null,
        })
        .then(() => {
          openPanel({ windowId: 0 }).then(() => {
            var payload = { ...message }
            delete payload.restart

            const newMessage = {
              uri: '/private/connect',
              verb: 'post',
              payload: payload,
            }
            browser.runtime
              .sendMessage(newMessage)
              .then(
                browser.runtime.sendMessage(message.controller.id, {
                  connected: true,
                })
              )
              .catch(() => {
                browser.runtime.sendMessage(
                  message.controller.id,
                  'Error Connecting to Selenium IDE'
                )
              })
          })
        })
    )
  }
}

browser.runtime.onMessageExternal.addListener(
  (message, sender, sendResponse) => {
    if (!message.payload) {
      message.payload = {}
    }

    let payload = message.payload

    payload.sender = sender.id
    if (message.uri.startsWith('/private/')) {
      return sendResponse(false)
    }
    browser.runtime
      .sendMessage(message)
      .then(sendResponse)
      .catch(() => {
        if (message.uri == '/control' && message.verb == 'post') {
          return openPanel({ windowId: 0 }).then(() => {
            const newMessage = {
              uri: '/private/connect',
              verb: 'post',
              payload: {
                controller: {
                  id: payload.sender,
                  name: payload.name,
                  version: payload.version,
                  commands: payload.commands,
                  dependencies: payload.dependencies,
                  jest: payload.jest,
                  exports: payload.exports,
                },
              },
            }
            browser.runtime.sendMessage(newMessage).then(sendResponse)
          })
        } else if (message.openSeleniumIDEIfClosed) {
          return openPanel({ windowId: 0 }).then(() => {
            sendResponse(true)
          })
        } else {
          return sendResponse({ error: 'Selenium IDE is not active' })
        }
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
