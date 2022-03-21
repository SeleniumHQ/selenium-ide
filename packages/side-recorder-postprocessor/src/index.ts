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
import EventEmitter from 'events'
import { events } from '@seleniumhq/side-commons'
import { CommandShape } from '@seleniumhq/side-model'

const EE = Symbol('event-emitter')

export default class RecordPostprocessor {
  constructor(baseUrl: string, commands: CommandShape[] = []) {
    this.baseUrl = baseUrl
    this.commands = [...commands]
    this[EE] = new EventEmitter()
    events.mergeEventEmitter(this, this[EE])
  }
  baseUrl: string
  commands: CommandShape[]
  lastRecordedCommand?: CommandShape;
  [EE]: EventEmitter

  add(index: number, step: CommandShape) {
    this.commands.splice(index, 0, step)
  }

  remove(index: number) {
    this.commands.splice(index, 1)
  }

  replace(index: number, step: CommandShape) {
    this.commands.splice(index, 1, step)
  }

  record(index: number, { command, target, value }: CommandShape) {
    const newCommand = this.parseCommand(command, target, value)
    this._splice(index, 0, newCommand)
    this.lastRecordedCommand = newCommand

    if (command === 'selectWindow' && target === 'handle=${root}')
      this.postprocessSelectWindow()
    this.postprocessDoubleClick(newCommand)
  }

  recordOpensWindow(windowHandleName: string) {
    if (this.lastRecordedCommand) {
      const command = this.lastRecordedCommand
      command.opensWindow = true
      command.windowHandleName = windowHandleName
      command.windowTimeout = 2000
    }
  }

  parseCommand(command: string, target: string, value: string): CommandShape {
    if (command === 'open') {
      return {
        command,
        target: this.parseRecordedUrl(target),
        value: '',
      } as CommandShape
    } else {
      let step: Partial<CommandShape> = {
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
      return step as CommandShape
    }
  }

  parseRecordedUrl(recordedUrl: string) {
    const url = new URL(recordedUrl)
    if (url.origin === this.baseUrl) {
      return `${url.pathname}${url.search}`
    } else {
      return recordedUrl
    }
  }

  postprocessDoubleClick(command: CommandShape) {
    const isDoubleClick = (command: string) =>
      command === 'doubleClickAt' || command === 'doubleClick'
    const isClick = (command: string) =>
      command === 'click' || command === 'clickAt'
    if (isDoubleClick(command.command) && this.commands.length >= 3) {
      const index = this.commands.indexOf(command)
      const lastCommand = this.commands[index - 1]
      const beforeLastCommand = this.commands[index - 2]
      if (
        isClick(lastCommand.command) &&
        isClick(beforeLastCommand.command) &&
        lastCommand.target === beforeLastCommand.target
      ) {
        this._splice(index - 2, 2)
      }
    }
  }

  postprocessSelectWindow() {
    const command: CommandShape = {
      command: 'storeWindowHandle',
      id: 'storeWindowHandle-root',
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
        this._splice(i, 0, command)
        return
      }
    }

    this._splice(0, 0, command)
  }

  _splice(index: number, removeCount: number, ...toAdd: CommandShape[]) {
    for (let i = 0; i < removeCount; i++) {
      const command = this.commands[index]
      this.commands.splice(index, 1)
      this[EE].emit(CommandsChanged.COMMAND_REMOVED, {
        index,
        command,
      })
    }

    toAdd.forEach((command, i) => {
      this.commands.splice(index + i, 0, command)
      this[EE].emit(CommandsChanged.COMMAND_ADDED, {
        index: index + i,
        command,
      })
    })
  }
}

export const CommandsChanged = {
  COMMAND_ADDED: 'added',
  COMMAND_REMOVED: 'removed',
}
