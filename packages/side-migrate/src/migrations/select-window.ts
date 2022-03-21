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

import { CommandShape, ProjectShape } from "@seleniumhq/side-model"

export default function migrate(project: ProjectShape) {
  let r = Object.assign({}, project)
  r.tests = r.tests.map(test => {
    return Object.assign({}, test, {
      commands: migrateCommands([...test.commands]),
    })
  })
  return r
}

migrate.version = '2.0'

function migrateCommands(commands: CommandShape[]) {
  let needsToAddRootStore = false
  let windowNamesCache: Record<string, string> = {}
  for (let i = 0; i < commands.length; i++) {
    let command = commands[i]
    if (command.command === 'selectWindow') {
      if (command.target === 'win_ser_local') {
        needsToAddRootStore = true
        commands[i] = Object.assign({}, command, {
          target: 'handle=${root}',
        })
      } else if (/^win_ser_/.test(command.target)) {
        if (!windowNamesCache[command.target]) {
          windowNamesCache[command.target] = `win${Math.floor(
            Math.random() * 10000
          )}`
          if (i > 0) {
            commands[i - 1] = Object.assign({}, commands[i - 1], {
              opensWindow: true,
              windowHandleName: windowNamesCache[command.target],
              windowTimeout: 2000,
            })
          }
        }
        commands[i] = Object.assign({}, command, {
          target: `handle=\${${windowNamesCache[command.target]}}`,
        })
      }
    } else if (command.command === 'close') {
      commands[i] = Object.assign({}, command, {
        target: '',
      })
    }
  }
  if (needsToAddRootStore) {
    commands.splice(1, 0, {
      comment: '',
      command: 'storeWindowHandle',
      id: 'asdfghjk-12345678-asdfghjk-12345678',
      target: 'root',
      targets: [],
      value: '',
    })
  }
  return commands
}
