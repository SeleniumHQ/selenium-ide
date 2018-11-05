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
import WindowSession from '../window-session'
import { Commands, ArgTypes } from '../../models/Command'

function isEmpty(commands) {
  return commands.length === 0
}

async function addInitialCommands(recordedUrl) {
  const { test } = UiState.selectedTest
  if (WindowSession.openedTabIds[test.id]) {
    const open = test.createCommand(0)
    open.setCommand('open')
    const setSize = test.createCommand(1)
    setSize.setCommand('setWindowSize')

    const tab = await browser.tabs.get(WindowSession.currentUsedTabId[test.id])
    const win = await browser.windows.get(tab.windowId)

    const url = new URL(recordedUrl ? recordedUrl : tab.url)
    if (!UiState.baseUrl) {
      UiState.setUrl(url.origin, true)
      open.setTarget(`${url.pathname}${url.search}`)
    } else if (url.origin === UiState.baseUrl) {
      open.setTarget(`${url.pathname}${url.search}`)
    } else {
      open.setTarget(recordedUrl)
    }
    setSize.setTarget(`${win.width}x${win.height}`)
  }
}

// for plugins
export function recordCommand(command, target, value, index, select = false) {
  const test = UiState.displayedTest
  if (isEmpty(test.commands)) {
    addInitialCommands()
  }
  const newCommand = test.createCommand(index ? index : getInsertionIndex(test))
  newCommand.setCommand(command)
  newCommand.setTarget(target)
  newCommand.setValue(value)

  if (select) {
    UiState.selectCommand(newCommand)
  }

  return newCommand
}

// for record module
export default function record(
  command,
  targets,
  value,
  insertBeforeLastCommand
) {
  if (UiState.isSelectingTarget) return
  const test = UiState.displayedTest
  if (isEmpty(test.commands) && command === 'open') {
    addInitialCommands(targets[0][0])
  } else if (command !== 'open') {
    let index = getInsertionIndex(test, insertBeforeLastCommand)
    if (preprocessDoubleClick(command, test, index)) {
      // double click removed the 2 clicks from before
      index -= 2
    }
    const newCommand = recordCommand(command, targets[0][0], value, index)
    if (Commands.list.has(command)) {
      const type = Commands.list.get(command).target
      if (type && type.name === ArgTypes.locator.name) {
        newCommand.setTargets(targets)
      }
    }
  }
}

function preprocessDoubleClick(command, test, index) {
  if (command === 'doubleClickAt' && test.commands.length >= 1) {
    const lastCommand = test.commands[index - 1]
    const beforeLastCommand = test.commands[index - 2]
    if (
      lastCommand.command === 'clickAt' &&
      lastCommand.command === beforeLastCommand.command &&
      lastCommand.target === beforeLastCommand.target &&
      lastCommand.value === beforeLastCommand.value
    ) {
      test.removeCommand(lastCommand)
      test.removeCommand(beforeLastCommand)
      return true
    }
  }
  return false
}

function getInsertionIndex(test, insertBeforeLastCommand = false) {
  let index = test.commands.length
  if (insertBeforeLastCommand) {
    index = test.commands.length - 1
  } else if (
    UiState.selectedCommand &&
    UiState.selectedCommand !== UiState.pristineCommand
  ) {
    index = test.commands.indexOf(UiState.selectedCommand)
  }

  return index
}
