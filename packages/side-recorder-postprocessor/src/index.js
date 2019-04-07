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

import { URL } from 'url'

export default class RecordPostprocessor {
  constructor(baseUrl, commands = [], insertionIndex = 0) {
    this.baseUrl = baseUrl
    this.commands = [...commands]
    this.insertionIndex = insertionIndex
  }

  record(command, target, value) {
    const newCommand = this.parseCommand(command, target, value)
    this.commands.splice(this.insertionIndex, 0, newCommand)
    this.insertionIndex++
    this.lastRecordedCommand = newCommand

    if (command === 'selectWindow' && target === 'handle=${root}')
      this.postprocessSelectWindow()
    this.postprocessDoubleClick(newCommand)
  }

  recordOpensWindow(windowHandleName) {
    if (this.lastRecordedCommand) {
      const command = this.lastRecordedCommand
      command.opensWindow = true
      command.windowHandleName = windowHandleName
      command.windowTimeout = 2000
    }
  }

  parseCommand(command, target, value) {
    if (command === 'open') {
      return {
        command,
        target: this.parseRecordedUrl(target),
        value: '',
      }
    } else {
      let step = {
        command,
      }
      if (Array.isArray(target)) {
        step.target = target[0][0]
        step.targetFallback = target
      } else {
        step.target = target
      }
      if (Array.isArray(value)) {
        step.value = value[0][0]
        step.valueFallback = value[0][0]
      } else {
        step.value = value
      }
      return step
    }
  }

  parseRecordedUrl(recordedUrl) {
    const url = new URL(recordedUrl)
    if (url.origin === this.baseUrl) {
      return `${url.pathname}${url.search}`
    } else {
      return recordedUrl
    }
  }

  postprocessDoubleClick(command) {
    const isDoubleClick = command =>
      command === 'doubleClickAt' || command === 'doubleClick'
    const isClick = command => command === 'click' || command === 'clickAt'
    if (isDoubleClick(command.command) && this.commands.length >= 3) {
      const index = this.commands.indexOf(command)
      const lastCommand = this.commands[index - 1]
      const beforeLastCommand = this.commands[index - 2]
      if (
        isClick(lastCommand.command) &&
        isClick(beforeLastCommand.command) &&
        lastCommand.target === beforeLastCommand.target
      ) {
        this.commands.splice(index - 2, 2)
        this.insertionIndex = this.insertionIndex - 2
      }
    }
  }

  postprocessSelectWindow() {
    const command = {
      command: 'storeWindowHandle',
      target: 'root',
      value: '',
    }
    for (let i = 0; i < this.commands.length; i++) {
      if (
        this.commands[i].command === 'storeWindowHandle' &&
        this.commands[i].target === 'root'
      ) {
        return
      }
      if (this.commands[i].command === 'selectWindow') {
        this.commands.splice(i, 0, command)
        this.insertionIndex++
        return
      }
    }

    this.commands.splice(0, 0, command)
    this.insertionIndex++
  }
}
