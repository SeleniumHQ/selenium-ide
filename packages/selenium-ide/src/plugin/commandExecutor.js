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

const commands = {}

export function registerCommand(command, func) {
  if (typeof command !== 'string') {
    throw new Error(
      `Expected to receive string instead received ${typeof command}`
    )
  } else if (typeof func !== 'function') {
    throw new Error(
      `Expected to receive function instead received ${typeof func}`
    )
  } else if (commands[command]) {
    throw new Error(`A command named ${command} already exists`)
  } else {
    commands[command] = func
  }
}

export function canExecuteCommand(command) {
  return commands.hasOwnProperty(command)
}

export function executeCommand(command, target, value, options) {
  if (!commands[command]) {
    throw new Error(`The command ${command} is not registered with any plugin`)
  } else {
    return commands[command](target, value, options)
  }
}
