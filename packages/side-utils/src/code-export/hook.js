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

export default class Hook {
  constructor({ startingSyntax, endingSyntax, registrationLevel } = {}) {
    this.startingSyntax = startingSyntax
    this.endingSyntax = endingSyntax
    this.registrationLevel = registrationLevel
    this.clearRegister = this.clearRegister.bind(this)
    this.emit = this.emit.bind(this)
    this.register = this.register.bind(this)
    this.isRegistered = this.isRegistered.bind(this)
    this.clearRegister()
  }

  clearRegister() {
    this.emitters = []
  }

  async emit(
    { isOptional, test, suite, tests, project, startingSyntaxOptions } = {
      isOptional: false,
    }
  ) {
    const commands = []
    let registeredCommandLevel = 0
    if (this.startingSyntax) {
      const _startingSyntax =
        typeof this.startingSyntax === 'function'
          ? this.startingSyntax(startingSyntaxOptions)
          : this.startingSyntax
      if (_startingSyntax.commands) {
        _startingSyntax.commands.forEach(command => {
          commands.push(command)
          registeredCommandLevel = command.level
        })
      } else {
        commands.push({ level: 0, statement: _startingSyntax })
      }
    }
    const name = test ? test.name : suite ? suite.name : undefined
    const emittedCommands = (await Promise.all(
      this.emitters.map(emitter => emitter({ name, tests, project }))
    )).filter(entry => entry != undefined)
    if (isOptional && !emittedCommands.length) return
    emittedCommands.forEach(command => {
      if (typeof command === 'object') {
        commands.push(command)
      } else if (typeof command === 'string') {
        command.split('\n').forEach(statement => {
          commands.push({
            level: this.registrationLevel
              ? this.registrationLevel
              : registeredCommandLevel,
            statement,
          })
        })
      }
    })
    if (this.endingSyntax) {
      if (this.endingSyntax.commands) {
        this.endingSyntax.commands.forEach(command => {
          commands.push(command)
        })
      } else {
        commands.push({ level: 0, statement: this.endingSyntax })
      }
    }
    return { commands }
  }

  register(emitter) {
    this.emitters.push(emitter)
  }

  async isRegistered(input = '') {
    const result = await Promise.all(this.emitters.map(emitter => emitter()))
    return result.includes(input)
  }
}

export function clearHooks(hooks) {
  Object.keys(hooks).forEach(hook => {
    hooks[hook].clearRegister()
  })
}
