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

import { action, observable, reaction } from 'mobx'
import uuidv4 from 'uuid/v4'
import Command from './Command'

export default class TestCase {
  id = null
  @observable
  name = null
  @observable
  commands = []
  nameDialogShown = false
  @observable
  modified = false
  @observable
  selectedCommand = null
  @observable
  scrollY = null

  constructor(id = uuidv4(), name = 'Untitled Test') {
    this.id = id
    this.name = name
    this.changeDisposer = reaction(
      () =>
        this.commands.map(({ command, target, targets, value }) => ({
          command,
          target,
          targets,
          value,
        })),
      () => {
        this.modified = true
      }
    )
    this.export = this.export.bind(this)
    this.dispose = this.dispose.bind(this)
  }

  @action.bound
  updateWindowHandleNames(oldValue, newValue) {
    const commands = this.commands
    commands.forEach(function(kommand) {
      kommand.target = kommand.target
        .split(`\${${oldValue}}`)
        .join(`\${${newValue}}`)
      kommand.value = kommand.value
        .split(`\${${oldValue}}`)
        .join(`\${${newValue}}`)
    })
    this.commands = commands
  }

  @action.bound
  setName(name) {
    this.name = name
    this.modified = true
  }

  @action.bound
  createCommand(index, c, t, v, comment) {
    if (index !== undefined && index.constructor.name !== 'Number') {
      throw new Error(
        `Expected to receive Number instead received ${
          index !== undefined ? index.constructor.name : index
        }`
      )
    } else {
      const command = new Command(undefined, c, t, v)
      command.addListener(
        'window-handle-name-changed',
        this.updateWindowHandleNames
      )
      if (comment) command.setComment(comment)
      index !== undefined
        ? this.commands.splice(index, 0, command)
        : this.commands.push(command)
      return command
    }
  }

  @action.bound
  addCommand(command) {
    if (!command || !(command instanceof Command)) {
      throw new Error(
        `Expected to receive Command instead received ${
          command ? command.constructor.name : command
        }`
      )
    } else {
      command.addListener(
        'window-handle-name-changed',
        this.updateWindowHandleNames
      )
      this.commands.push(command)
    }
  }

  @action.bound
  insertCommandAt(command, index) {
    if (!command || !(command instanceof Command)) {
      throw new Error(
        `Expected to receive Command instead received ${
          command ? command.constructor.name : command
        }`
      )
    } else if (index === undefined || index.constructor.name !== 'Number') {
      throw new Error(
        `Expected to receive Number instead received ${
          index !== undefined ? index.constructor.name : index
        }`
      )
    } else {
      this.commands.splice(index, 0, command)
    }
  }

  @action.bound
  swapCommands(from, to) {
    const command = this.commands.splice(from, 1)[0]
    this.insertCommandAt(command, to)
  }

  @action.bound
  removeCommand(command) {
    command.removeListener(
      'window-handle-name-changed',
      this.updateWindowHandleNames
    )
    this.commands.remove(command)
  }

  @action.bound
  clearAllCommands() {
    this.commands.clear()
  }

  export() {
    return {
      id: this.id,
      name: this.name,
      commands: this.commands.map(c => c.export()),
    }
  }

  dispose() {
    this.changeDisposer()
  }

  @action
  static fromJS = function(jsRep) {
    const test = new TestCase(jsRep.id)
    test.setName(jsRep.name)
    test.commands.replace(jsRep.commands.map(Command.fromJS))

    return test
  }
}
