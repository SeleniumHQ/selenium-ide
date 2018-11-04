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

import { Commands, ArgTypes } from '../../models/Command'

export default function migrate(project) {
  let r = Object.assign({}, project)
  r.tests = r.tests.map(test => {
    return Object.assign({}, test, {
      commands: test.commands.map(c => {
        if (Commands.list.has(c.command)) {
          let newCmd = Object.assign({}, c)
          const type = Commands.list.get(c.command)
          if (type.target && type.target.name === ArgTypes.locator.name) {
            newCmd.target = migrateLocator(newCmd.target)
          }
          if (type.value && type.value.name === ArgTypes.locator.name) {
            newCmd.value = migrateLocator(newCmd.value)
          }
          if (newCmd.targets) {
            newCmd.targets = newCmd.targets.map(targetTuple => [
              migrateLocator(targetTuple[0]),
              targetTuple[1],
            ])
          }
          return newCmd
        }
        return c
      }),
    })
  })
  return r
}

function migrateLocator(locator) {
  const result = locator.match(/^([A-Za-z]+)=.+/)
  if (!result) {
    const implicitType = locator.indexOf('//') === -1 ? 'id' : 'xpath'
    return `${implicitType}=${locator}`
  }
  return locator
}

migrate.version = '1.1'
