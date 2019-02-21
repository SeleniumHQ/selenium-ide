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
import UiState from '../../stores/view/UiState'
import PlaybackState from '../../stores/view/PlaybackState'
import ModalState from '../../stores/view/ModalState'
import WindowSession from '../../IO/window-session'
import { TargetTypes } from '../../models/Command/Commands'
import Region from '../../models/Region'
import { xlateArgument } from './formatCommand'

async function getActiveTabForTest() {
  const identifier = WindowSession.currentUsedWindowId[
    UiState.selectedTest.test.id
  ]
    ? UiState.selectedTest.test.id
    : WindowSession.generalUseIdentifier
  const lastUsedWindowId = WindowSession.currentUsedWindowId[identifier]
  const tabs = await browser.tabs.query({
    active: true,
    windowId: lastUsedWindowId,
  })
  return tabs[0]
}

export async function find(target) {
  try {
    const xlatedTarget = xlateArgument(target, PlaybackState.variables)
    const tab = await getActiveTabForTest()
    const region = new Region(xlatedTarget)
    await browser.windows.update(tab.windowId, {
      focused: true,
    })
    try {
      await browser.tabs.sendMessage(tab.id, {
        showElement: true,
        targetValue: region.isValid() ? region.toJS() : xlatedTarget,
      })
    } catch (e) {
      ModalState.showAlert({
        title: 'Element not found',
        description: `Could not find ${xlatedTarget} on the page`,
        confirmLabel: 'close',
      })
    }
  } catch (e) {
    showNoTabAvailableDialog()
  }
}

export async function select(type, rect, selectNext = false) {
  UiState.setSelectingTarget(!UiState.isSelectingTarget)
  try {
    const tab = await getActiveTabForTest()
    if (!UiState.isSelectingTarget) {
      browser.tabs
        .sendMessage(tab.id, { selectMode: true, selecting: false })
        .catch(() => {})
    } else {
      PlaybackState.stopPlaying().catch(() => {})
      await browser.windows.update(tab.windowId, {
        focused: true,
      })
      if (type === TargetTypes.LOCATOR) {
        await browser.tabs.sendMessage(tab.id, {
          selectMode: true,
          selecting: true,
          element: true,
          selectNext,
        })
      } else if (type === TargetTypes.REGION) {
        await browser.tabs.sendMessage(tab.id, {
          selectMode: true,
          selecting: true,
          region: true,
          rect: new Region(rect).toJS(),
          selectNext,
        })
      }
    }
  } catch (e) {
    UiState.setSelectingTarget(false)
    showNoTabAvailableDialog()
  }
}

function selectTarget(target) {
  UiState.setSelectingTarget(false)
  if (UiState.selectedCommand) {
    UiState.selectedCommand.setTargets(target)
    UiState.selectedCommand.setTarget(target[0][0])
  } else if (UiState.selectedTest.test) {
    const command = UiState.selectedTest.test.createCommand()
    command.setTargets(target)
    command.setTarget(target[0][0])
  }
}

function endSelection(tabId) {
  UiState.setSelectingTarget(false)
  browser.tabs
    .sendMessage(tabId, { selectMode: true, selecting: false })
    .catch(() => {})
}

function handleContentScriptResponse(message, sender, sendResponse) {
  if (message.selectTarget) {
    selectTarget(message.target)
    sendResponse(true)
  }
  if (message.cancelSelectTarget) {
    endSelection(sender.tab.id)
    sendResponse(true)
  }
  if (message.selectNext) {
    UiState.selectNextCommand()
  }
}

function showNoTabAvailableDialog() {
  UiState.windowSession.focusIDEWindow()
  ModalState.showAlert({
    title: 'Tab not found',
    description:
      'No tab is available for this test case, either continue recording it, or play it back.',
    confirmLabel: 'close',
  })
}

if (browser && browser.runtime && browser.runtime.onMessage) {
  browser.runtime.onMessage.addListener(handleContentScriptResponse)
}
