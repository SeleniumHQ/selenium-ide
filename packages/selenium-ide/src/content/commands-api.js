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
import './closure-polyfill'
import TargetSelector from './targetSelector'
import Selenium from './selenium-api'
import BrowserBot from './selenium-browserbot'
import LocatorBuilders from './locatorBuilders'
import { editRegion, removeRegion } from './region'
import { attach } from './prompt-injector'

export const selenium = new Selenium(BrowserBot.createForWindow(window, true))
const locatorBuilders = new LocatorBuilders(window)
let contentSideexTabId = window.contentSideexTabId
let targetSelector

attach(selenium)

function doCommands(request, _sender, sendResponse) {
  if (request.commands) {
    if (request.commands == 'waitPreparation') {
      selenium['doWaitPreparation']('', selenium.preprocessParameter(''))
      sendResponse({})
    } else if (request.commands == 'prePageWait') {
      selenium['doPrePageWait']('', selenium.preprocessParameter(''))
      sendResponse({ new_page: window.sideex_new_page })
    } else if (request.commands == 'pageWait') {
      selenium['doPageWait']('', selenium.preprocessParameter(''))
      sendResponse({ page_done: window.sideex_page_done })
    } else if (request.commands == 'ajaxWait') {
      selenium['doAjaxWait']('', selenium.preprocessParameter(''))
      sendResponse({ ajax_done: window.sideex_ajax_done })
    } else if (request.commands == 'domWait') {
      selenium['doDomWait']('', selenium.preprocessParameter(''))
      sendResponse({ dom_time: window.sideex_new_page })
    } else if (request.commands === 'evaluateConditional') {
      try {
        let value = selenium['doEvaluateConditional'](request.target)
        sendResponse({ result: 'success', value: value })
      } catch (e) {
        sendResponse({ result: e.message })
      }
    } else {
      const upperCase =
        request.commands.charAt(0).toUpperCase() + request.commands.slice(1)
      if (selenium['do' + upperCase] != null) {
        try {
          document.body.setAttribute('SideeXPlayingFlag', true)
          let returnValue = selenium['do' + upperCase](
            selenium.preprocessParameter(request.target),
            selenium.preprocessParameter(request.value)
          )
          if (returnValue instanceof Promise) {
            // The command is a asynchronous function
            returnValue
              .then(function() {
                // Asynchronous command completed successfully
                document.body.removeAttribute('SideeXPlayingFlag')
                sendResponse({ result: 'success' })
              })
              .catch(function(reason) {
                // Asynchronous command failed
                document.body.removeAttribute('SideeXPlayingFlag')
                sendResponse({ result: reason })
              })
          } else {
            // Synchronous command completed successfully
            document.body.removeAttribute('SideeXPlayingFlag')
            sendResponse({ result: 'success' })
          }
        } catch (e) {
          // Synchronous command failed
          document.body.removeAttribute('SideeXPlayingFlag')
          sendResponse({ result: e.message })
        }
      } else {
        sendResponse({ result: 'Unknown command: ' + request.commands })
      }
    }

    //do every command need giving sideex id
    if (contentSideexTabId === -1) {
      contentSideexTabId = request.mySideexTabId
    }
    return true
  }
  if (request.prepareToInteract) {
    sendResponse({
      result: 'success',
      rect: selenium.prepareToInteract_(request.locator),
    })
  }
  if (request.buildLocators) {
    try {
      const element = selenium.browserbot.findElement(request.locator)
      const locators = locatorBuilders.buildAll(element)
      sendResponse({ result: 'success', locators })
    } catch (e) {
      sendResponse({ result: e.message })
    }
  }
  if (request.resolveLocator) {
    try {
      const element = selenium.browserbot.findElement(request.locator)
      const locator = locatorBuilders
        .buildAll(element)
        .find(([loc, strat]) => /^xpath/.test(strat))[0] //eslint-disable-line no-unused-vars
      sendResponse({ result: 'success', locator })
    } catch (e) {
      sendResponse({ result: e.message })
    }
  }
  if (request.selectMode) {
    sendResponse(true)
    if (request.selecting && request.element) {
      targetSelector = new TargetSelector(
        function(element, win) {
          if (element && win) {
            const target = locatorBuilders.buildAll(element)
            locatorBuilders.detach()
            if (target != null && target instanceof Array) {
              if (target) {
                //self.editor.treeView.updateCurrentCommand('targetCandidates', target);
                browser.runtime.sendMessage({
                  selectTarget: true,
                  target: target,
                  selectNext: request.selectNext,
                })
              }
            }
          }
          targetSelector = null
        },
        function() {
          browser.runtime.sendMessage({
            cancelSelectTarget: true,
          })
        }
      )
    } else if (request.selecting && request.region) {
      editRegion(request.rect, target => {
        if (target) {
          browser.runtime.sendMessage({
            selectTarget: true,
            target: [[target]],
            selectNext: request.selectNext,
          })
        } else {
          browser.runtime.sendMessage({
            cancelSelectTarget: true,
            selectNext: request.selectNext,
          })
        }
      })
    } else {
      if (targetSelector) {
        targetSelector.cleanup()
        targetSelector = null
        return
      } else {
        removeRegion()
        return
      }
    }
  }
}

// show element
function startShowElement(message) {
  if (message.showElement) {
    try {
      const result = selenium['doShowElement'](message.targetValue)
      return Promise.resolve({ result: result })
    } catch (e) {
      // If we didn't find the element, it means that another frame might have found it,
      // so we don't resolve the promise. If no frame finds it, then the promise will
      // get rejected.
    }
  }
}

if (!window._listener) {
  window._listener = doCommands
  browser.runtime.onMessage.addListener(startShowElement)
  browser.runtime.onMessage.addListener(doCommands)
}
