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

import { action, computed, observable, toJS } from 'mobx'
import uuidv4 from 'uuid/v4'
import Fuse from 'fuse.js'
import { Commands as _Commands } from './Commands'
import { ArgTypes as _ArgTypes } from './ArgTypes'
const EventEmitter = require('events')
import { mergeEventEmitter } from '../../../common/events'

const DEFAULT_NEW_WINDOW_TIMEOUT = 2000
const EE = Symbol('event-emitter')

export default class Command {
  id = null
  @observable
  comment = ''
  @observable
  command
  @observable
  target
  @observable
  targets = []
  @observable
  value
  @observable
  isBreakpoint = false
  @observable
  opensWindow = false
  @observable
  windowHandleName = ''
  @observable
  windowTimeout = DEFAULT_NEW_WINDOW_TIMEOUT
  @observable
  opensWindowRead = false

  constructor(id = uuidv4(), command, target, value) {
    this.id = id
    this.command = command || ''
    this.target = target || ''
    this.value = value || ''
    this.export = this.export.bind(this)
    this[EE] = new EventEmitter()
    mergeEventEmitter(this, this[EE])
  }

  @computed
  get displayedName() {
    return this.enabled ? this.command : this.command.substr(2)
  }

  @computed
  get enabled() {
    return this.command && !this.command.startsWith('//')
  }

  @computed
  get isValid() {
    return Commands.array.includes(this.command)
  }

  @action.bound
  clone() {
    const clone = new Command()
    clone.setData(this.export())
    return clone
  }

  @action.bound
  setComment(comment) {
    this.comment = comment || ''
  }

  @action.bound
  setCommand(command) {
    if (Commands.values[command]) {
      this.command = Commands.values[command]
    } else {
      this.command = command || ''
    }
  }

  @action.bound
  setTarget(target) {
    this.target = target || ''
  }

  @action.bound
  setTargets(targets = []) {
    this.targets.replace(targets)
  }

  @action.bound
  setValue(value) {
    this.value = value ? value.replace(/\n/g, '\\n') : ''
  }

  @action.bound
  setOpensWindow(opensWindow) {
    if (typeof opensWindow == typeof true) {
      this.opensWindow = opensWindow
      if (!this.windowHandleName) {
        this.windowHandleName = `win${Math.floor(Math.random() * 10000)}`
      }
    }
  }

  @action.bound
  setWindowHandleName(newName) {
    const oldName = this.windowHandleName
    this.windowHandleName = newName
    this[EE].emit('window-handle-name-changed', oldName, newName)
  }

  @action.bound
  toggleOpensWindowRead() {
    this.opensWindowRead = !this.opensWindowRead
  }

  @action.bound
  setWindowTimeout(timeout) {
    this.windowTimeout = timeout
  }

  @action.bound
  toggleBreakpoint() {
    this.isBreakpoint = !this.isBreakpoint
  }

  @action.bound
  toggleEnabled() {
    if (this.enabled) {
      this.setCommand('//' + this.command)
    } else {
      this.setCommand(this.command.substr(2))
    }
  }

  @action.bound
  setData(jsRep) {
    this.setComment(jsRep.comment)
    this.setCommand(jsRep.command)
    this.setTarget(jsRep.target)
    this.setTargets(jsRep.targets)
    this.setValue(jsRep.value)

    if (jsRep.opensWindow) {
      this.setOpensWindow(jsRep.opensWindow)
      this.setWindowHandleName(jsRep.windowHandleName)
      this.setWindowTimeout(jsRep.windowTimeout)
    }
  }

  export() {
    let exported = {
      id: this.id,
      comment: this.comment,
      command: this.command,
      target: this.target,
      targets: toJS(this.targets),
      value: this.value,
    }

    if (this.opensWindow) {
      exported.opensWindow = this.opensWindow
      exported.windowHandleName = this.windowHandleName
      exported.windowTimeout = this.windowTimeout
    }

    return exported
  }

  static fromJS = function(jsRep) {
    const command = new Command(jsRep.id)
    command.setData(jsRep)
    return command
  }
}

export const ArgTypes = _ArgTypes

class CommandList {
  @observable
  list = new Map(_Commands)

  @computed
  get array() {
    return Array.from(this.list.keys())
  }

  @computed
  get values() {
    return this.array.reduce((commands, command) => {
      commands[this.list.get(command).name] = command
      return commands
    }, {})
  }

  @computed
  get fuse() {
    return new Fuse(Array.from(this.list.values()), {
      shouldSort: true,
      threshold: 0.4,
      location: 0,
      distance: 100,
      maxPatternLength: 50,
      minMatchCharLength: 1,
      keys: ['name'],
    })
  }

  @action.bound
  search(pattern) {
    return this.fuse.search(pattern)
  }

  @action.bound
  addCommand(id, name) {
    if (this.list.has(id)) {
      throw new Error(`Command with the id ${id} already exists`)
    } else {
      this.list.set(id, name)
    }
  }

  static get instance() {
    if (!this._instance) {
      this._instance = new CommandList()
    }
    return this._instance
  }
}

export const Commands = CommandList.instance

export const ControlFlowCommandNames = {
  do: 'do',
  else: 'else',
  elseIf: 'elseIf',
  end: 'end',
  if: 'if',
  repeatIf: 'repeatIf',
  times: 'times',
  while: 'while',
}

function commandNamesEqual(command, target) {
  if (command) {
    return command.command === target
  } else {
    return false
  }
}

function isBlockOpen(command) {
  return isIf(command) || isLoop(command)
}

function isConditional(command) {
  switch (command.command) {
    case ControlFlowCommandNames.elseIf:
    case ControlFlowCommandNames.if:
    case ControlFlowCommandNames.repeatIf:
    case ControlFlowCommandNames.times:
    case ControlFlowCommandNames.while:
      return true
    default:
      return false
  }
}

function isControlFlow(command) {
  switch (command.command) {
    case ControlFlowCommandNames.if:
    case ControlFlowCommandNames.elseIf:
    case ControlFlowCommandNames.else:
    case ControlFlowCommandNames.end:
    case ControlFlowCommandNames.do:
    case ControlFlowCommandNames.repeatIf:
    case ControlFlowCommandNames.times:
    case ControlFlowCommandNames.while:
      return true
    default:
      return false
  }
}

function isDo(command) {
  return commandNamesEqual(command, ControlFlowCommandNames.do)
}

function isElse(command) {
  return commandNamesEqual(command, ControlFlowCommandNames.else)
}

function isElseIf(command) {
  return commandNamesEqual(command, ControlFlowCommandNames.elseIf)
}

function isElseOrElseIf(command) {
  return isElseIf(command) || isElse(command)
}

function isEnd(command) {
  return commandNamesEqual(command, ControlFlowCommandNames.end)
}

function isIf(command) {
  return commandNamesEqual(command, ControlFlowCommandNames.if)
}

function isIfBlock(command) {
  return isIf(command) || isElseOrElseIf(command)
}

function isLoop(command) {
  return (
    commandNamesEqual(command, ControlFlowCommandNames.while) ||
    commandNamesEqual(command, ControlFlowCommandNames.times) ||
    commandNamesEqual(command, ControlFlowCommandNames.repeatIf)
  )
}

function isTerminal(command) {
  return isElse(command) || isDo(command) || isEnd(command)
}

function isTimes(command) {
  return commandNamesEqual(command, ControlFlowCommandNames.times)
}

export const ControlFlowCommandChecks = {
  isIfBlock: isIfBlock,
  isConditional: isConditional,
  isDo: isDo,
  isElse: isElse,
  isElseOrElseIf: isElseOrElseIf,
  isEnd: isEnd,
  isIf: isIf,
  isLoop: isLoop,
  isBlockOpen: isBlockOpen,
  isTerminal: isTerminal,
  isControlFlow: isControlFlow,
  isTimes: isTimes,
}
