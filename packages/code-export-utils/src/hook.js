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
    this.clearRegister()
  }

  clearRegister() {
    this.registeredCommands = []
  }

  emit({ isOptional } = { isOptional: false }) {
    if (isOptional && !this.registeredCommands.length) return ''
    const commands = []
    let registeredCommandLevel = 1
    if (this.startingSyntax) {
      if (this.startingSyntax.commands) {
        this.startingSyntax.commands.forEach(command => {
          commands.push(command)
          registeredCommandLevel = command.level
        })
      } else {
        commands.push({ level: 0, statement: this.startingSyntax })
      }
    }
    this.registeredCommands.forEach(command => {
      if (typeof command === 'object') {
        commands.push(command)
      } else if (typeof command === 'string') {
        commands.push({
          level: this.registrationLevel
            ? this.registrationLevel
            : registeredCommandLevel,
          statement: command,
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

  register(input) {
    input.split('\n').forEach(value => {
      this.registeredCommands.push(value)
    })
  }
}
