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

export default function migrate(project) {
  let r = Object.assign({}, project)
  r.tests = r.tests.map(test => {
    const commands = addAcceptAlert(test.commands)
    return Object.assign({}, test, {
      commands: commands
        .filter(c => !commandsToRemove.includes(c.command))
        .map(c => {
          if (commandsToReplace[c.command]) {
            return Object.assign({}, c, {
              command: commandsToReplace[c.command],
            })
          }
          return c
        }),
    })
  })
  return r
}

function addAcceptAlert(commands) {
  let cmds = [...commands]
  for (let i = 0; i < cmds.length; i++) {
    if (cmds[i].command === 'assertAlert') {
      cmds.splice(i + 1, 0, {
        command: 'acceptAlert',
        target: '',
        value: '',
      })
    }
  }
  return cmds
}

const commandsToRemove = [
  'answerOnNextPrompt',
  'chooseCancelOnNextPrompt',
  'chooseOkOnNextConfirmation',
  'chooseCancelOnNextConfirmation',
]
const commandsToReplace = {
  webdriverAnswerOnVisiblePrompt: 'answerPrompt',
  webdriverChooseCancelOnVisiblePrompt: 'dismissPrompt',
  webdriverChooseOkOnVisibleConfirmation: 'acceptConfirmation',
  webdriverChooseCancelOnVisibleConfirmation: 'dismissConfirmation',
}

migrate.version = '3.0'
